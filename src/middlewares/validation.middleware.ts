import { Request, Response, NextFunction } from 'express';

// Middleware helper for validating requests
export const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    // Validation logic here
    next();
};
