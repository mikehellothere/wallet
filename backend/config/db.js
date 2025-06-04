import {neon} from '@neondatabase/serverless';
import "dotenv/config";

// CRETE A NEON DATABASE CONNECTION
export const sql = neon(process.env.DATABASE_URL);