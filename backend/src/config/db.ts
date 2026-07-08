import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fretza';
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('================================================');
    console.error('DATABASE CONNECTION ERROR: Failed to connect to MongoDB!');
    console.error(error instanceof Error ? error.message : error);
    console.error('Please make sure your MongoDB service is running.');
    console.error('================================================');
    process.exit(1);
  }
};
