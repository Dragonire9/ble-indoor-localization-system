import { BeaconTelemetryRepository } from '../repositories/telemetry.repository';
import { BeaconRepository } from '../repositories/beacon.repository';
import { MqttTelemetryPayload } from '../types/mqtt.types';
import logger from '../lib/logger';

interface QueuedTelemetry {
  beaconId: string;
  payload: MqttTelemetryPayload;
  timestamp: Date;
  retryCount: number;
}

export class TelemetryService {
  private telemetryRepository: BeaconTelemetryRepository;
  private beaconRepository: BeaconRepository;
  private messageQueue: QueuedTelemetry[] = [];
  private maxRetries = 5;
  private retryDelay = 1000; // Start with 1 second

  constructor(
    telemetryRepository: BeaconTelemetryRepository,
    beaconRepository: BeaconRepository
  ) {
    this.telemetryRepository = telemetryRepository;
    this.beaconRepository = beaconRepository;
  }

  async processTelemetry(beaconId: string, payload: MqttTelemetryPayload): Promise<void> {
    try {
      // Verify beacon exists
      const beacon = await this.beaconRepository.findById(beaconId);
      if (!beacon) {
        logger.warn('Telemetry received for unknown beacon', { beaconId });
        return;
      }

      // Store telemetry
      await this.telemetryRepository.create(beaconId, payload);
      logger.info('Telemetry stored successfully', { beaconId });

      // Process queued messages if any
      await this.processQueue();
    } catch (error) {
      logger.error('Failed to store telemetry', {
        beaconId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Queue for retry
      this.queueTelemetry(beaconId, payload);
    }
  }

  private queueTelemetry(beaconId: string, payload: MqttTelemetryPayload): void {
    this.messageQueue.push({
      beaconId,
      payload,
      timestamp: new Date(),
      retryCount: 0,
    });
    logger.info('Telemetry queued for retry', { beaconId, queueSize: this.messageQueue.length });
  }

  private async processQueue(): Promise<void> {
    const now = new Date();
    const toRetry: QueuedTelemetry[] = [];

    for (const item of this.messageQueue) {
      if (item.retryCount >= this.maxRetries) {
        logger.error('Max retries exceeded for telemetry', {
          beaconId: item.beaconId,
          retryCount: item.retryCount,
        });
        continue;
      }

      const delay = this.retryDelay * Math.pow(2, item.retryCount); // Exponential backoff
      const elapsed = now.getTime() - item.timestamp.getTime();

      if (elapsed >= delay) {
        toRetry.push(item);
      }
    }

    // Remove items being retried from queue
    this.messageQueue = this.messageQueue.filter((item) => !toRetry.includes(item));

    // Retry queued items
    for (const item of toRetry) {
      try {
        await this.telemetryRepository.create(item.beaconId, item.payload);
        logger.info('Queued telemetry stored successfully', {
          beaconId: item.beaconId,
          retryCount: item.retryCount,
        });
      } catch (error) {
        // Re-queue with incremented retry count
        item.retryCount++;
        item.timestamp = new Date();
        this.messageQueue.push(item);
        logger.warn('Retry failed, re-queuing telemetry', {
          beaconId: item.beaconId,
          retryCount: item.retryCount,
        });
      }
    }
  }
}
