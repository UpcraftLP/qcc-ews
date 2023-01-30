import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
    token: string;
    clientId: string;
	meta: Meta;
	logging: Logging;
	healthCheck: HealthCheck;
}

interface Meta {
	env: string;
	development: boolean;
	version: string;
	commitSha: string;
}

interface Logging {
	webhooks: string[];
	alerts: string;
	alertsUsers: string[];
	level: string;
	logEvents: boolean;
}

interface HealthCheck {
	enabled: boolean;
	port: number;
	interface: string;
}

export const get = (key: string, defaultValue?: string): string => {
	if (defaultValue === undefined && process.env[key] === undefined)
		throw new Error(`Missing config value for key: ${key}`);

	return (process.env[key] ?? defaultValue) as string;
};

export const getNumber = (key: string, defaultValue?: number) => {
	const value = get(key, defaultValue?.toString());
	const number = parseInt(value || '');

	if (isNaN(number))
		throw new Error(`Config value for key: ${key} is not parsable`);

	return number;
};

export const getBool = (key: string, defaultValue?: boolean) => {
	const value = get(key, defaultValue?.toString() ?? 'false');

	const validValues = new Set<string>(['true', '1', 'yes','y']);
	return validValues.has(value.toLowerCase());
};

const nodeEnv = get('NODE_ENV', 'production');
const developmentEnvironment = nodeEnv.toLowerCase() === 'development';

const meta: Meta = {
	env: nodeEnv,
	development: developmentEnvironment,
	version: get('VERSION', 'development'),
	commitSha: get('COMMIT_SHA', 'unknown'),
};

const logging: Logging = {
	webhooks: get('LOG_WEBHOOKS', '').split(',').filter(it => it.trim() !== ''),
	alerts: get('EMERGENCY_ALERT_URL', '').trim(),
	alertsUsers: get('EMERGENCY_ALERT_USERS', '').split(',').filter(it => it.trim() !== ''),
	level: get('LOG_LEVEL', developmentEnvironment ? 'trace' : 'debug'),
	logEvents: getBool('LOG_EVENTS', true),
};

const healthCheck: HealthCheck = {
	enabled: getBool('HEALTHCHECK_ENABLED', true),
	port: getNumber('HEALTHCHECK_PORT', 8000),
	interface: get('HEALTHCHECK_LISTEN_ON', '0.0.0.0'),
};

const config: Config = {
	token: get('DISCORD_TOKEN'),
	clientId: get('DISCORD_CLIENT_ID'),
	meta,
	logging,
	healthCheck,
};

export default config;