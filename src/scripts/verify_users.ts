import mongoose from 'mongoose';
import { User } from '../models/user.model';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airtable-forms');
        console.log('Connected to DB');

        const count = await User.countDocuments();
        console.log(`User Count: ${count}`);

        if (count > 0) {
            const user = await User.findOne().sort({ lastLogin: -1 });
            console.log('Latest User:', {
                id: user?._id,
                airtableId: user?.airtableUserId,
                hasAccess: !!user?.accessToken,
                hasRefresh: !!user?.refreshToken,
                expiresAt: user?.tokenExpiresAt
            });
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
