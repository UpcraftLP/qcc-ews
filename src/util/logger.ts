import pino from 'pino';
import config from './config';
import 'pino-pretty';

const streams: pino.StreamEntry[] = [
	{ stream: pino.destination(1) },
	{ stream: pino.destination({ dest: 'logs/latest.log', mkdir: true }) },
];

const logger = pino({
	level: config.logging.level,
	formatters: {
		level: (label) => ({ level: label }),
	},
	redact: {
		paths: ['pid', 'hostname'],
		remove: true
	}
}, pino.multistream(streams));

export const eventLogger = pino({
	level: 'trace',
	formatters: {
		level: (label) => ({ level: label }),
	}
}, pino.destination({ dest: 'logs/events.log', mkdir: true }));

export default logger;