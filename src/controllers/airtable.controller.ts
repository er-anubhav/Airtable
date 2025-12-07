import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AirtableService } from '../services/airtable.service';

export const getBases = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const bases = await AirtableService.getBases(req.user);
        console.log('[DEBUG] Fetched Bases:', JSON.stringify(bases, null, 2));
        res.status(200).json({ success: true, data: bases });
    } catch (error) {
        next(error);
    }
};

export const getTables = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const { baseId } = req.params;
        const tables = await AirtableService.getTables(req.user, baseId);
        res.status(200).json({ success: true, data: tables });
    } catch (error) {
        next(error);
    }
};

export const getFields = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const { baseId, tableId } = req.params;
        const fields = await AirtableService.getFields(req.user, baseId, tableId);
        res.status(200).json({ success: true, data: fields });
    } catch (error) {
        next(error);
    }
};
