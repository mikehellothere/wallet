import express from 'express';
import dotenv from 'dotenv';
import {sql} from './config/db.js'; // Adjust the path as necessary
import rateLimiter from './middleware/rateLimiter.js';



// Load environment variables from .env file
// This allows you to use environment variables defined in a .env file.
// Ensure you have a .env file with the necessary variables (e.g., DATABASE_URL, PORT)
dotenv.config();

// Create an Express application instance
// This sets up the Express application to handle incoming requests and define routes.
const app = express();


// Middleware 
app.use(rateLimiter); // Apply rate limiting middleware
app.use(express.json()); 


// Set up the port from environment variables or default to 5001
// This allows the server to listen on a specific port defined in the environment variables or defaults to 5001. 
const PORT = process.env.PORT || 5001;


// Initialize the database and create the transactions table if it doesn't exist
async function initDB() {
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


// Define routes
// This route handles the root path and responds with a welcome message.
app.get("/", (req, res) => {
    res.send("Welcome to the Transactions API");
});


// This route fetches all transactions for a specific user by userId
app.get("/api/transactions/:userId", async (req, res) => {
    try {
        const {userId} = req.params;
        const transcations =await sql`
        SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
        `;
        res.status(200).json(transcations);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({message: "Internal server error"});

    }
});

// This route handles the creation of a new transaction
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

// This route handles updating an existing transaction by its ID
app.put("/api/transactions/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const {title, amount, category} = req.body;

        if(isNaN(parseInt(id))) {
            return res.status(400).json({message: 'Invalid transaction ID'});
        }

        if(!title || !category || amount === undefined) {
            return res.status(400).json({message: 'All fields are required'});
        }

        const result = await sql`
            UPDATE transactions 
            SET title = ${title}, amount = ${amount}, category = ${category}
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            return res.status(404).json({message: 'Transaction not found'});
        }

        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({message: "Internal server error"});
    }
});

// This route handles deleting a transaction by its ID 
app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const {id} = req.params;
        if(isNaN(parseInt(id))) {
            return res.status(400).json({message: 'Invalid transaction ID'});
        }
        const result = await sql`
            DELETE FROM transactions WHERE id = ${id} RETURNING *
        `;
        if (result.length === 0) {
            return res.status(404).json({message: 'Transaction not found'});
        }
        res.status(200).json({message: 'Transaction deleted successfully'});
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({message: "Internal server error"});
    }
});

// This route fetches a summary of transactions for a specific user
app.get("/api/transactions/summary/:userId", async (req, res) => {
    try {
        const {userId} = req.params;
        const balanceResult =  await sql`
        SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}
        `;
        const incomeResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as income FROM transactions 
            WHERE user_id = ${userId} AND amount > 0
        `;
        const expensesResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as expenses FROM transactions
            WHERE user_id = ${userId} AND amount < 0
        `;
       

         res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expenses: expensesResult[0].expenses
        });
    } catch (error) {
        console.error('Error getting the summary:', error);
        res.status(500).json({message: "Internal server error"});
    }
});



// Initialize the database and start the server
initDB().then(() => {
    app.listen(PORT, () => {
    console.log('Database initialized successfully on port:', PORT);
    });
});