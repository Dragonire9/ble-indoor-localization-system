import logger from '../lib/logger';
import { AppError } from '../middleware/error-handler.middleware';
import { BeaconRepository } from '../repositories/beacon.repository';
import { BeaconQueryFilters, CreateBeaconInput, UpdateBeaconInput } from '../types/beacon.types';
import { PaginatedResponse } from '../types/pagination.types';

export class BeaconService {
  constructor(private beaconRepository: BeaconRepository) {}

  async createBeacon(data: CreateBeaconInput) {
    // Check for duplicate beacon ID
    const existing = await this.beaconRepository.findById(data.beaconId);
    if (existing) {
      throw new AppError(`Beacon with ID ${data.beaconId} already exists`, 409);
    }

    const beacon = await this.beaconRepository.create(data);
    logger.info('Beacon created', { beaconId: beacon.beaconId });
    return beacon;
  }

  async getBeaconById(beaconId: string) {
    const beacon = await this.beaconRepository.findById(beaconId);
    if (!beacon) {
      throw new AppError(`Beacon with ID ${beaconId} not found`, 404);
    }
    return beacon;
  }

  async getAllBeacons(filters?: BeaconQueryFilters): Promise<PaginatedResponse<any>> {
    const result = await this.beaconRepository.findAll(filters);
    const { data, total, page, limit } = result;

    const totalPages = Math.ceil(total / limit);

    logger.debug('Retrieved beacons', {
      count: data.length,
      total,
      page,
      limit,
      totalPages,
      filters,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async updateBeacon(beaconId: string, data: UpdateBeaconInput) {
    const existing = await this.beaconRepository.findById(beaconId);
    if (!existing) {
      throw new AppError(`Beacon with ID ${beaconId} not found`, 404);
    }

    const updated = await this.beaconRepository.update(beaconId, data);
    logger.info('Beacon updated', { beaconId, updates: Object.keys(data) });
    return updated;
  }

  async deleteBeacon(beaconId: string) {
    const existing = await this.beaconRepository.findById(beaconId);
    if (!existing) {
      throw new AppError(`Beacon with ID ${beaconId} not found`, 404);
    }

    await this.beaconRepository.delete(beaconId);
    logger.info('Beacon deleted', { beaconId });
  }

  async getFilterCounts(filters?: BeaconQueryFilters) {
    const counts = await this.beaconRepository.getFilterCounts(filters);
    logger.debug('Retrieved filter counts', { counts, filters });
    return counts;
  }
}
