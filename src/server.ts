import app from './app';
import { PORT } from './config';
import { connectDB } from './config/db';

// Connect to Database
connectDB();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
