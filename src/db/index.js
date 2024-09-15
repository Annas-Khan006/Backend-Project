// src/db/index.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // `useNewUrlParser` and `useUnifiedTopology` are removed
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MONGODB connection FAILED: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;