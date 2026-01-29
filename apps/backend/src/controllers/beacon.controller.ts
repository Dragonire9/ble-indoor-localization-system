import { NextFunction, Request, Response } from 'express';
import { BeaconTelemetryRepository } from '../repositories/telemetry.repository';
import { BeaconService } from '../services/beacon.service';

/**
 * @swagger
 * tags:
 *   name: Beacons
 *   description: Beacon management endpoints
 */
export class BeaconController {
  constructor(
    private beaconService: BeaconService,
    private telemetryRepository: BeaconTelemetryRepository
  ) {}

  /**
   * @swagger
   * /api/beacons:
   *   get:
   *     summary: Get all beacons
   *     description: Retrieve a paginated list of beacons with optional filtering by sector or connection state
   *     tags: [Beacons]
   *     parameters:
   *       - in: query
   *         name: sectorId
   *         schema:
   *           type: string
   *         description: Filter beacons by sector ID
   *       - in: query
   *         name: connectionState
   *         schema:
   *           type: string
   *           enum: [ONLINE, OFFLINE]
   *         description: Filter beacons by connection state
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
   *         description: Paginated list of beacons
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Beacon'
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
  async getAllBeacons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sectorIdParam = req.query.sectorId as string | undefined;
      const sectorId = sectorIdParam?.includes(',') ? sectorIdParam.split(',') : sectorIdParam;

      const connectionStateParam = req.query.connectionState as string | undefined;
      const connectionState = connectionStateParam?.includes(',')
        ? (connectionStateParam.split(',') as ('ONLINE' | 'OFFLINE')[])
        : (connectionStateParam as 'ONLINE' | 'OFFLINE' | undefined);
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const result = await this.beaconService.getAllBeacons({
        sectorId,
        connectionState,
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
   * /api/beacons/{beaconId}:
   *   get:
   *     summary: Get beacon by ID
   *     description: Retrieve a specific beacon by its ID
   *     tags: [Beacons]
   *     parameters:
   *       - in: path
   *         name: beaconId
   *         required: true
   *         schema:
   *           type: string
   *         description: Beacon ID
   *     responses:
   *       200:
   *         description: Beacon details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Beacon'
   *       404:
   *         description: Beacon not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getBeaconById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const beaconId = Array.isArray(req.params.beaconId)
        ? req.params.beaconId[0]
        : req.params.beaconId;
      const beacon = await this.beaconService.getBeaconById(beaconId);

      // Include associated geofence if available
      const response = {
        ...beacon,
        geofence: beacon.geofenceId ? { id: beacon.geofenceId } : null,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/beacons:
   *   post:
   *     summary: Create a new beacon
   *     description: Register a new beacon in the system
   *     tags: [Beacons]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - beaconId
   *               - sectorId
   *             properties:
   *               beaconId:
   *                 type: string
   *                 description: Unique beacon identifier
   *               sectorId:
   *                 type: string
   *                 description: Sector ID this beacon belongs to
   *               geofenceId:
   *                 type: string
   *                 nullable: true
   *                 description: Optional geofence ID
   *               powerState:
   *                 type: string
   *                 enum: [ON, OFF, LOW_BATTERY]
   *                 default: ON
   *               mqttUsername:
   *                 type: string
   *                 nullable: true
   *               metadata:
   *                 type: object
   *                 additionalProperties: true
   *     responses:
   *       201:
   *         description: Beacon created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Beacon'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async createBeacon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const beacon = await this.beaconService.createBeacon(req.body);
      res.status(201).json(beacon);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/beacons/{beaconId}:
   *   put:
   *     summary: Update a beacon
   *     description: Update beacon configuration
   *     tags: [Beacons]
   *     parameters:
   *       - in: path
   *         name: beaconId
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
   *               sectorId:
   *                 type: string
   *               geofenceId:
   *                 type: string
   *                 nullable: true
   *               powerState:
   *                 type: string
   *                 enum: [ON, OFF, LOW_BATTERY]
   *               metadata:
   *                 type: object
   *                 additionalProperties: true
   *     responses:
   *       200:
   *         description: Beacon updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Beacon'
   *       404:
   *         description: Beacon not found
   */
  async updateBeacon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const beaconId = Array.isArray(req.params.beaconId)
        ? req.params.beaconId[0]
        : req.params.beaconId;
      const beacon = await this.beaconService.updateBeacon(beaconId, req.body);
      res.json(beacon);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/beacons/{beaconId}:
   *   delete:
   *     summary: Delete a beacon
   *     description: Remove a beacon from the system
   *     tags: [Beacons]
   *     parameters:
   *       - in: path
   *         name: beaconId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Beacon deleted successfully
   *       404:
   *         description: Beacon not found
   */
  async deleteBeacon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const beaconId = Array.isArray(req.params.beaconId)
        ? req.params.beaconId[0]
        : req.params.beaconId;
      await this.beaconService.deleteBeacon(beaconId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/beacons/{beaconId}/telemetry:
   *   get:
   *     summary: Get beacon telemetry history
   *     description: Retrieve telemetry data for a specific beacon with optional time range filtering
   *     tags: [Beacons]
   *     parameters:
   *       - in: path
   *         name: beaconId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Start date for telemetry query
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: End date for telemetry query
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *         description: Maximum number of records to return
   *     responses:
   *       200:
   *         description: Telemetry data
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/BeaconTelemetry'
   *       404:
   *         description: Beacon not found
   */
  async getBeaconTelemetry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const beaconId = Array.isArray(req.params.beaconId)
        ? req.params.beaconId[0]
        : req.params.beaconId;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

      // Verify beacon exists
      await this.beaconService.getBeaconById(beaconId);

      const telemetry = await this.telemetryRepository.findByBeaconId(beaconId, {
        startDate,
        endDate,
        limit,
      });

      res.json(telemetry);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/beacons/filter-counts:
   *   get:
   *     summary: Get filter counts for faceted filters
   *     description: Returns total counts for each filter option (sectors and connection states) without applying any filters
   *     tags: [Beacons]
   *     responses:
   *       200:
   *         description: Filter counts
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 sectors:
   *                   type: object
   *                   additionalProperties:
   *                     type: integer
   *                   description: Count of beacons per sector ID
   *                 connectionStates:
   *                   type: object
   *                   properties:
   *                     ONLINE:
   *                       type: integer
   *                     OFFLINE:
   *                       type: integer
   */
  async getFilterCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sectorIdParam = req.query.sectorId as string | undefined;
      const sectorId = sectorIdParam?.includes(',') ? sectorIdParam.split(',') : sectorIdParam;

      const connectionStateParam = req.query.connectionState as string | undefined;
      const connectionState = connectionStateParam?.includes(',')
        ? (connectionStateParam.split(',') as ('ONLINE' | 'OFFLINE')[])
        : (connectionStateParam as 'ONLINE' | 'OFFLINE' | undefined);

      const counts = await this.beaconService.getFilterCounts({
        sectorId,
        connectionState,
      });
      res.json(counts);
    } catch (error) {
      next(error);
    }
  }
}
