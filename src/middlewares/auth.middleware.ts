import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { User, IUser } from '../models/user.model';

export interface AuthRequest extends Request {
    user?: IUser;
}

// Middleware to verify authentication (e.g. JWT or Airtable session)
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication failed: No token provided' });
            return;
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);

        // Find user by airtableUserId (which is what we put in 'id')
        const user = await User.findOne({ airtableUserId: decoded.id });

        if (!user) {
            res.status(401).json({ success: false, message: 'Authentication failed: User not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Authentication failed: Invalid token' });
    }
};

