import mongoose from 'mongoose';
import { MONGO_URI } from './index';
import { logger } from '../utils/logger';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        logger.info('MongoDB connected successfully');
    } catch (error: any) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};
