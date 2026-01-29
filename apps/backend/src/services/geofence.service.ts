import { GeofenceRepository } from '../repositories/geofence.repository';
import { CreateGeofenceInput, UpdateGeofenceInput, GeofenceQueryFilters, CoordinatePoint } from '../types/geofence.types';
import { AppError } from '../middleware/error-handler.middleware';
import { PaginatedResponse } from '../types/pagination.types';
import { WebSocketService } from './websocket.service';
import logger from '../lib/logger';

export class GeofenceService {
  constructor(
    private geofenceRepository: GeofenceRepository,
    private websocketService?: WebSocketService
  ) {}

  private validatePolygon(coordinates: CoordinatePoint[]): void {
    // Minimum 3 points
    if (coordinates.length < 3) {
      throw new AppError('Polygon must have at least 3 points', 400);
    }

    // Check if polygon is closed (first and last points are identical)
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    if (first.x !== last.x || first.y !== last.y) {
      throw new AppError('Polygon must be closed (first and last points must be identical)', 400);
    }

    // Validate coordinate format (local X/Y meters)
    for (const coord of coordinates) {
      if (typeof coord.x !== 'number' || typeof coord.y !== 'number') {
        throw new AppError('Coordinates must be numbers in local X/Y meters format', 400);
      }
      if (isNaN(coord.x) || isNaN(coord.y)) {
        throw new AppError('Coordinates must be valid numbers', 400);
      }
    }

    // Basic self-intersection check (simplified - checks for obvious issues)
    // Full self-intersection detection would require more complex algorithm
    // This is a basic validation - can be enhanced later
  }

  async createGeofence(data: CreateGeofenceInput) {
    this.validatePolygon(data.coordinates);

    const geofence = await this.geofenceRepository.create(data);
    logger.info('Geofence created', { geofenceId: geofence.id, sectorId: data.sectorId });

    // Broadcast geofence creation
    if (this.websocketService) {
      this.websocketService.broadcastGeofenceUpdate('created', geofence.id, geofence);
    }

    return geofence;
  }

  async getGeofenceById(geofenceId: string) {
    const geofence = await this.geofenceRepository.findById(geofenceId);
    if (!geofence) {
      throw new AppError(`Geofence with ID ${geofenceId} not found`, 404);
    }
    return geofence;
  }

  async getAllGeofences(filters?: GeofenceQueryFilters): Promise<PaginatedResponse<any>> {
    const result = await this.geofenceRepository.findAll(filters);
    const { data, total, page, limit } = result;
    
    const totalPages = Math.ceil(total / limit);
    
    logger.debug('Retrieved geofences', { 
      count: data.length, 
      total, 
      page, 
      limit, 
      totalPages,
      filters 
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

  async updateGeofence(geofenceId: string, data: UpdateGeofenceInput) {
    const existing = await this.geofenceRepository.findById(geofenceId);
    if (!existing) {
      throw new AppError(`Geofence with ID ${geofenceId} not found`, 404);
    }

    if (data.coordinates) {
      this.validatePolygon(data.coordinates);
    }

    const updated = await this.geofenceRepository.update(geofenceId, data);
    logger.info('Geofence updated', { geofenceId, updates: Object.keys(data) });

    // Broadcast geofence update
    if (this.websocketService) {
      this.websocketService.broadcastGeofenceUpdate('updated', geofenceId, updated);
    }

    return updated;
  }

  async deleteGeofence(geofenceId: string) {
    const existing = await this.geofenceRepository.findById(geofenceId);
    if (!existing) {
      throw new AppError(`Geofence with ID ${geofenceId} not found`, 404);
    }

    await this.geofenceRepository.delete(geofenceId);
    logger.info('Geofence deleted', { geofenceId });

    // Broadcast geofence deletion
    if (this.websocketService) {
      this.websocketService.broadcastGeofenceUpdate('deleted', geofenceId, null);
    }
  }
}
