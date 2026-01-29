import { Request, Response, NextFunction } from 'express';
import { SectorService } from '../services/sector.service';

/**
 * @swagger
 * tags:
 *   name: Sectors
 *   description: Sector management endpoints
 */
export class SectorController {
  constructor(private sectorService: SectorService) {}

  /**
   * @swagger
   * /api/sectors:
   *   get:
   *     summary: Get all sectors
   *     description: Retrieve a paginated list of sectors with their associated beacons and geofences
   *     tags: [Sectors]
   *     parameters:
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
   *         description: Paginated list of sectors
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Sector'
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
  async getAllSectors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const result = await this.sectorService.getAllSectors(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/sectors/{sectorId}:
   *   get:
   *     summary: Get sector by ID
   *     description: Retrieve a specific sector by its ID with associated beacons and geofences
   *     tags: [Sectors]
   *     parameters:
   *       - in: path
   *         name: sectorId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Sector details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Sector'
   *       404:
   *         description: Sector not found
   */
  async getSectorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sectorId = Array.isArray(req.params.sectorId) ? req.params.sectorId[0] : req.params.sectorId;
      const sector = await this.sectorService.getSectorById(sectorId);
      res.json(sector);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/sectors:
   *   post:
   *     summary: Create a new sector
   *     description: Create a new sector (logical zone) in the system
   *     tags: [Sectors]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sectorId
   *               - name
   *             properties:
   *               sectorId:
   *                 type: string
   *                 description: Unique sector identifier
   *               name:
   *                 type: string
   *                 description: Sector name
   *               description:
   *                 type: string
   *                 nullable: true
   *               metadata:
   *                 type: object
   *                 additionalProperties: true
   *     responses:
   *       201:
   *         description: Sector created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Sector'
   *       400:
   *         description: Validation error
   */
  async createSector(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sector = await this.sectorService.createSector(req.body);
      res.status(201).json(sector);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/sectors/{sectorId}:
   *   put:
   *     summary: Update a sector
   *     description: Update sector configuration
   *     tags: [Sectors]
   *     parameters:
   *       - in: path
   *         name: sectorId
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
   *               description:
   *                 type: string
   *                 nullable: true
   *               metadata:
   *                 type: object
   *                 additionalProperties: true
   *     responses:
   *       200:
   *         description: Sector updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Sector'
   *       404:
   *         description: Sector not found
   */
  async updateSector(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sectorId = Array.isArray(req.params.sectorId) ? req.params.sectorId[0] : req.params.sectorId;
      const sector = await this.sectorService.updateSector(sectorId, req.body);
      res.json(sector);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/sectors/{sectorId}:
   *   delete:
   *     summary: Delete a sector
   *     description: Remove a sector from the system
   *     tags: [Sectors]
   *     parameters:
   *       - in: path
   *         name: sectorId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Sector deleted successfully
   *       404:
   *         description: Sector not found
   */
  async deleteSector(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sectorId = Array.isArray(req.params.sectorId) ? req.params.sectorId[0] : req.params.sectorId;
      await this.sectorService.deleteSector(sectorId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
