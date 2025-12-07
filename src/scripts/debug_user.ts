import mongoose from 'mongoose';
import { User } from '../models/user.model';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airtable-forms');
        console.log('Connected to DB');

        const user = await User.findOne().sort({ lastLogin: -1 });
        if (!user) {
            console.log('No user found');
            return;
        }

        console.log('User Debug Data:');
        console.log('ID:', user._id);
        console.log('Airtable ID:', user.airtableUserId);
        console.log('Email:', user.profile?.email);
        console.log('Scopes:', user.scopes);

        console.log('\nTesting Token against Airtable API...');
        try {
            const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            console.log('API Response Status:', response.status);
            console.log('API Data:', JSON.stringify(response.data, null, 2));
        } catch (apiErr: any) {
            console.error('API Error:', apiErr.response?.status, apiErr.response?.data);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
