import { SectorRepository } from '../repositories/sector.repository';
import { AppError } from '../middleware/error-handler.middleware';
import { PaginatedResponse } from '../types/pagination.types';
import logger from '../lib/logger';

export class SectorService {
  constructor(private sectorRepository: SectorRepository) {}

  async createSector(data: { sectorId: string; name: string; description?: string; metadata?: Record<string, unknown> }) {
    // Check for duplicate sector ID
    const existing = await this.sectorRepository.findById(data.sectorId);
    if (existing) {
      throw new AppError(`Sector with ID ${data.sectorId} already exists`, 409);
    }

    const sector = await this.sectorRepository.create(data);
    logger.info('Sector created', { sectorId: sector.sectorId });
    return sector;
  }

  async getSectorById(sectorId: string) {
    const sector = await this.sectorRepository.findById(sectorId);
    if (!sector) {
      throw new AppError(`Sector with ID ${sectorId} not found`, 404);
    }
    return sector;
  }

  async getAllSectors(page?: number, limit?: number): Promise<PaginatedResponse<any>> {
    const result = await this.sectorRepository.findAll(page, limit);
    const { data, total, page: pageNum, limit: limitNum } = result;
    
    const totalPages = Math.ceil(total / limitNum);
    
    logger.debug('Retrieved sectors', { 
      count: data.length, 
      total, 
      page: pageNum, 
      limit: limitNum, 
      totalPages 
    });
    
    return {
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };
  }

  async updateSector(sectorId: string, data: { name?: string; description?: string; metadata?: Record<string, unknown> }) {
    const existing = await this.sectorRepository.findById(sectorId);
    if (!existing) {
      throw new AppError(`Sector with ID ${sectorId} not found`, 404);
    }

    const updated = await this.sectorRepository.update(sectorId, data);
    logger.info('Sector updated', { sectorId, updates: Object.keys(data) });
    return updated;
  }

  async deleteSector(sectorId: string) {
    const existing = await this.sectorRepository.findById(sectorId);
    if (!existing) {
      throw new AppError(`Sector with ID ${sectorId} not found`, 404);
    }

    await this.sectorRepository.delete(sectorId);
    logger.info('Sector deleted', { sectorId });
  }
}
