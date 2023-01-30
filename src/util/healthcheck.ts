import http, { IncomingMessage, ServerResponse } from 'http';
import config from './config';
import logger from './logger';

function start(): Promise<http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>> {
	const requestHandler = (req: IncomingMessage, res: ServerResponse) => {
		if(req.url === '/health') {
			res.statusCode = 200;
		}
		else {
			res.statusCode = 404;
		}
		res.end();
	};

	const server = http.createServer(requestHandler);

	return new Promise((resolve) => {
		server.listen(config.healthCheck.port, config.healthCheck.interface, () => {
			logger.info(`Health check server listening on http://${config.healthCheck.interface}:${config.healthCheck.port}`);
			resolve(server);
		});
	});
}

export default { start };