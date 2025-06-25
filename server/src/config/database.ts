import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const dbconnect = async (): Promise<void> => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    await mongoose.connect(dbUrl);
    console.log('✅ DB Connected Successfully');
  } catch (error) {
    const err = error as Error;
    console.error('❌ DB Connection Failed:', err.message);
    process.exit(1);
  }
};
