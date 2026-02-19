import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ฟังก์ชันสำหรับ Test Connection
export const connectDB = async () => {
  try {
    await pool.connect();
    console.log('✅ Database Connected Successfully');
  } catch (err) {
    console.error('❌ Database Connection Failed:', err);
    process.exit(1);
  }
};
