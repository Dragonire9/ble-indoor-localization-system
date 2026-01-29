import { httpServer } from './app';
import { closeMqttClient } from './lib/mqtt-client';
import logger from './lib/logger';

const PORT = process.env.PORT || 8000;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  closeMqttClient();
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  closeMqttClient();
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
