import { channelMention, EmbedBuilder, Events, GatewayIntentBits, GuildMember, roleMention, time, userMention, WebhookClient, WebhookMessageCreateOptions } from 'discord.js';
import { Client } from 'discord.js';
import timestamps from './util/timestamps';
import config from './util/config';
import logger, { eventLogger } from './util/logger';
import healthcheck from './util/healthcheck';

process.on('uncaughtException', (err) => {
	logger.fatal(err);
	process.exit(1);
});

process.on('unhandledRejection', (err) => {
	logger.fatal(err);
	process.exit(1);
});

logger.info(`Version: ${config.meta.version}`);
logger.info(`Ref: ${config.meta.commitSha}`);
logger.info(`Environment: ${config.meta.development ? 'Development' : 'Production'}`);
logger.info('Starting bot...');

// one of the known bad user accounts, to compare the creation date to.
const knownBadUserId = '963511021652303882';

// mention to add to all messages
// TODO make configurable per webhook URL
const mentionId = '1068542967276638258';

const minPingDuration = 10 * 60 * 1000; // 10 minutes
let lastPingSent = 0;


const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers
	]
});
const webhooks = config.logging.webhooks.map(webhookUrl => new WebhookClient({ url: webhookUrl }));

let filterTimestamp: number | undefined = undefined;

const main = async () => {
	client.once(Events.ClientReady, async () => {
		logger.info(`[STARTUP] fetching user ${knownBadUserId}...`);
		try {
			const badUser = await client.users.fetch(knownBadUserId);
			logger.info(`[STARTUP] caching filter timestamp for '${badUser.username}': ${badUser.createdTimestamp} (${badUser.createdAt.toUTCString()})`);
			filterTimestamp = badUser.createdTimestamp;
		}
		catch (error) {
			logger.fatal(error, `[STARTUP] unable to look up user id ${knownBadUserId}!`);
			if (config.logging.alerts !== '') {
				const wh = new WebhookClient({ url: config.logging.alerts });
				if (config.logging.alertsUsers.length > 0) {
					await wh.send(`[ERROR] Hey ${config.logging.alertsUsers.map(user => userMention(user)).join(', ')}, I couldn't find user with id ${knownBadUserId}, bot is shutting down!`);
				}
				else {
					await wh.send(`[ERROR] I couldn't find user with id ${knownBadUserId}, bot is shutting down!`);
				}
			}
			throw error;
		}

		if (config.healthCheck.enabled) {
			await healthcheck.start();
		}
		logger.info(`[READY] connected to discord as ${client.user?.tag}`);

		// make bot appear offline to hide from user lists
		client.user?.setStatus('invisible');

		const guilds = await client.guilds.fetch();
		logger.info(`Guilds: (${guilds.size} total)\n` + guilds.map(guild => `\t${guild.id}: ${guild.name}`).join('\n'));
	});
	client.addListener(Events.GuildMemberAdd, async (member: GuildMember) => {
		logger.debug(`[JOIN] ${member.id}`);
		if (filterTimestamp !== undefined && timestamps.isTimestampAround(member.user.createdTimestamp, filterTimestamp)) {
			logger.info(`suspicious member: ${member.user.username}#${member.user.discriminator} (${member.user.id}), created at: ${member.user.createdTimestamp}`);
			if (config.logging.logEvents) {
				eventLogger.info({
					id: member.user.id,
					guild: member.guild.id,
					username: `${member.user.username}#${member.user.discriminator}`,
					created: member.user.createdTimestamp,
				});
			}

			// fallback: members without avatar get a random colored one based on their discriminator
			const avatarUrl = member.user.avatarURL() ?? `https://cdn.discordapp.com/embed/avatars/${Number(member.user.discriminator) % 5}.png`;

			const flags = (await member.user.fetchFlags()).toArray();

			const embed = new EmbedBuilder()
				.setTitle('Suspicious Member')
				.setColor(0xffff45)
				.setAuthor({
					name: `${member.user.username}#${member.user.discriminator}`,
					iconURL: avatarUrl
				})
				.setThumbnail(avatarUrl)
				.addFields([
					{
						name: '__Basic Information__',
						value: `
                        **Tag:** \`${member.user.username}#${member.user.discriminator}\`
                        **ID:** \`${member.user.id}\`
                        **Mention:** ${userMention(member.user.id)}\n`,
					},
					{
						name: 'Created',
						value: `${time(member.user.createdAt)} (${time(member.user.createdAt, 'R')})\n`,
					},
					{
						name: 'Flags',
						value: flags.length > 0 ? flags.map(flag => `\`${flag}\``).join(', ') : 'None',
					},
					{
						name: '__Reason__',
						value: `User creation date is very close to known bad accounts.
                        Case Ref: \`Raid Awakens\` (${channelMention('1068669989177004123')})`
					}
				])
				.setTimestamp(member.joinedAt)
				.setFooter({ text: 'powered by Up' });

			const payload: WebhookMessageCreateOptions = {
				username: member.guild.name,
				avatarURL: member.guild.iconURL() ?? undefined,
				embeds: [embed]
			};

			const now = Date.now();
			if (now - lastPingSent > minPingDuration) {
				payload.content = roleMention(mentionId);
				lastPingSent = now;
			}

			webhooks.forEach(webhook => {
				try {
					webhook.send(payload);
				}
				catch (error) {
					logger.error(error, 'Error sending webhook message to ' + webhook.url);
				}
			});
		}
	});
	await client.login(config.token);
};

main().catch(error => logger.error(`Unexpected error occured: ${error}`));
