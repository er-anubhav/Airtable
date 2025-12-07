import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { FormService } from '../services/form.service';

export const createForm = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const form = await FormService.createForm(req.user._id.toString(), req.body);
        res.status(201).json({ success: true, data: form });
    } catch (error) {
        next(error);
    }
};

export const getForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const form = await FormService.getFormById(id);
        res.status(200).json({ success: true, data: form });
    } catch (error) {
        next(error);
    }
};

export const getMyForms = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found in request');
        const forms = await FormService.getFormsByUser(req.user._id.toString());
        res.status(200).json({ success: true, data: forms });
    } catch (error) {
        next(error);
    }
}
