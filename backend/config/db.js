import {neon} from '@neondatabase/serverless';
import "dotenv/config";

// CRETE A NEON DATABASE CONNECTION
export const sql = neon(process.env.DATABASE_URL);

// Initialize the database and create the transactions table if it doesn't exist
export async function initDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS transactions(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;
        console.log('Database connection established and table created successfully.');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit the process if the database connection fails
    }
}
