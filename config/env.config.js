import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  EMAIL: process.env.EMAIL || '',
  PASSWORD: process.env.PASSWORD || '',
  BASE_URL: process.env.BASE_URL || 'https://grounded-topaz.vercel.app',
};

