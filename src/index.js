const config = require('config')
const logger = require('./logger')

const app = require('./app');
const port = config.port;
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info(`Application started on http://${config.host}:${port}`)
);
