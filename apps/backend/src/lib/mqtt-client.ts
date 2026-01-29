import mqtt, { MqttClient } from 'mqtt';
import logger from './logger';

let mqttClient: MqttClient | null = null;

export const initializeMqttClient = (): MqttClient => {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  const username = process.env.MQTT_BROKER_USERNAME;
  const password = process.env.MQTT_BROKER_PASSWORD;

  const options: mqtt.IClientOptions = {
    clientId: `ble-backend-${Date.now()}`,
    ...(username && password && { username, password }),
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  };

  mqttClient = mqtt.connect(brokerUrl, options);

  mqttClient.on('connect', () => {
    logger.info('MQTT client connected to broker', { brokerUrl });
  });

  mqttClient.on('error', (error) => {
    const errorMessage = error?.message || error?.toString() || 'Unknown MQTT error';
    logger.error('MQTT client error', { error: errorMessage });

    // Don't crash the app if MQTT broker is unavailable
    // The app can still function for API endpoints without MQTT
    if (process.env.NODE_ENV === 'development') {
      logger.warn('MQTT broker may not be running. API endpoints will still work without MQTT.', {
        brokerUrl,
        hint: 'Start an MQTT broker or set MQTT_BROKER_URL environment variable',
      });
    }
  });

  mqttClient.on('close', () => {
    logger.warn('MQTT client connection closed');
  });

  mqttClient.on('reconnect', () => {
    logger.info('MQTT client reconnecting...');
  });

  return mqttClient;
};

export const getMqttClient = (): MqttClient => {
  if (!mqttClient) {
    throw new Error('MQTT client not initialized. Call initializeMqttClient() first.');
  }
  return mqttClient;
};

export const closeMqttClient = (): void => {
  if (mqttClient) {
    mqttClient.end();
    mqttClient = null;
    logger.info('MQTT client closed');
  }
};
