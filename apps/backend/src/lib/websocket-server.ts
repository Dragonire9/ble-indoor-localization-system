import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import logger from './logger';

let io: SocketIOServer | null = null;

export const initializeWebSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // Configure appropriately for production
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info('WebSocket client connected', { socketId: socket.id });

    // Handle reconnection
    socket.on('reconnect', (attemptNumber) => {
      logger.info('WebSocket client reconnected', { socketId: socket.id, attemptNumber });
    });

    socket.on('disconnect', (reason) => {
      logger.info('WebSocket client disconnected', { socketId: socket.id, reason });
    });

    socket.on('error', (error) => {
      logger.error('WebSocket error', { socketId: socket.id, error: error.message });
    });

    // Handle client subscriptions (for future filtering)
    socket.on('subscribe:beacons', () => {
      logger.debug('Client subscribed to beacon updates', { socketId: socket.id });
    });

    socket.on('subscribe:telemetry', (data: { beaconIds?: string[] }) => {
      logger.debug('Client subscribed to telemetry updates', {
        socketId: socket.id,
        beaconIds: data?.beaconIds,
      });
    });
  });

  logger.info('WebSocket server initialized');
  return io;
};

export const getWebSocketServer = (): SocketIOServer => {
  if (!io) {
    throw new Error('WebSocket server not initialized. Call initializeWebSocketServer() first.');
  }
  return io;
};
