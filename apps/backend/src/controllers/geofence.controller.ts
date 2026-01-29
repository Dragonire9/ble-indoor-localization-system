import { Request, Response, NextFunction } from 'express';
import { GeofenceService } from '../services/geofence.service';

/**
 * @swagger
 * tags:
 *   name: Geofences
 *   description: Geofence management endpoints
 */
export class GeofenceController {
  constructor(private geofenceService: GeofenceService) {}

  /**
   * @swagger
   * /api/geofences:
   *   get:
   *     summary: Get all geofences
   *     description: Retrieve a paginated list of geofences with optional filtering
   *     tags: [Geofences]
   *     parameters:
   *       - in: query
   *         name: sectorId
   *         schema:
   *           type: string
   *         description: Filter geofences by sector ID
   *       - in: query
   *         name: beaconId
   *         schema:
   *           type: string
   *         description: Filter geofences by associated beacon ID
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number (1-based)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: Paginated list of geofences
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Geofence'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *                     hasNext:
   *                       type: boolean
   *                     hasPrev:
   *                       type: boolean
   */
  async getAllGeofences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sectorId = req.query.sectorId as string | undefined;
      const beaconId = req.query.beaconId as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const result = await this.geofenceService.getAllGeofences({
        sectorId,
        beaconId,
        page,
        limit,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/geofences/{geofenceId}:
   *   get:
   *     summary: Get geofence by ID
   *     description: Retrieve a specific geofence by its ID
   *     tags: [Geofences]
   *     parameters:
   *       - in: path
   *         name: geofenceId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Geofence details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Geofence'
   *       404:
   *         description: Geofence not found
   */
  async getGeofenceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const geofenceId = Array.isArray(req.params.geofenceId) ? req.params.geofenceId[0] : req.params.geofenceId;
      const geofence = await this.geofenceService.getGeofenceById(geofenceId);
      res.json(geofence);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/geofences:
   *   post:
   *     summary: Create a new geofence
   *     description: Create a new polygon-based geofence for indoor localization
   *     tags: [Geofences]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sectorId
   *               - coordinates
   *             properties:
   *               sectorId:
   *                 type: string
   *               name:
   *                 type: string
   *                 nullable: true
   *               coordinates:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     x:
   *                       type: number
   *                       description: X coordinate in meters
   *                     y:
   *                       type: number
   *                       description: Y coordinate in meters
   *                 minItems: 3
   *                 description: Array of coordinate points forming a polygon
   *               metadata:
   *                 type: object
   *                 additionalProperties: true
   *     responses:
   *       201:
   *         description: Geofence created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Geofence'
   *       400:
   *         description: Validation error (invalid polygon, etc.)
   */
  async createGeofence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const geofence = await this.geofenceService.createGeofence(req.body);
      res.status(201).json(geofence);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/geofences/{geofenceId}:
   *   put:
   *     summary: Update a geofence
   *     description: Update geofence configuration
   *     tags: [Geofences]
   *     parameters:
   *       - in: path
   *         name: geofenceId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               coordinates:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     x:
   *                       type: number
   *                     y:
   *                       type: number
   *               metadata:
   *                 type: object
   *                 additionalProperties: true
   *     responses:
   *       200:
   *         description: Geofence updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Geofence'
   *       404:
   *         description: Geofence not found
   */
  async updateGeofence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const geofenceId = Array.isArray(req.params.geofenceId) ? req.params.geofenceId[0] : req.params.geofenceId;
      const geofence = await this.geofenceService.updateGeofence(geofenceId, req.body);
      res.json(geofence);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/geofences/{geofenceId}:
   *   delete:
   *     summary: Delete a geofence
   *     description: Remove a geofence from the system
   *     tags: [Geofences]
   *     parameters:
   *       - in: path
   *         name: geofenceId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Geofence deleted successfully
   *       404:
   *         description: Geofence not found
   */
  async deleteGeofence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const geofenceId = Array.isArray(req.params.geofenceId) ? req.params.geofenceId[0] : req.params.geofenceId;
      await this.geofenceService.deleteGeofence(geofenceId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
