import express from 'express';
import dotenv from 'dotenv';
import {sql} from './config/db.js'; // Adjust the path as necessary

dotenv.config();

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

const PORT = process.env.PORT || 5001;

async function initDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS transactions(
            user_id SERIAL PRIMARY KEY,
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
    
app.get("/", (req, res) => {
    res.send("Welcome to the Transactions API");
});

app.post("/api/transactions", async (req, res) => {
    try {
        const {user_id, title, amount, category} = req.body;

        if(!user_id || !title || !category || amount === undefined) {
            return res.status(400).json({message: 'All fields are required'});
        }
        
        const transaction = await sql`
            INSERT INTO transactions(user_id, title, amount, category)
            VALUES (${user_id}, ${title}, ${amount}, ${category})
            RETURNING *
        `;

        console.log(transaction);
        res.status(201).json(transaction[0]); // Return the inserted transaction

    } catch (error) {
        console.log('Error inserting transaction:', error);
        res.status(500).json({message: "Internal server error"});
    }
});


initDB().then(() => {
    app.listen(PORT, () => {
    console.log('Database initialized successfully on port:', PORT);
    });
});