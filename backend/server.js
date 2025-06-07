import express from 'express';
import dotenv from 'dotenv';
import {initDB} from './config/db.js'; // Adjust the path as necessary
import rateLimiter from './middleware/rateLimiter.js';

import transactionsRoute from './routes/transactionsRoute.js'; // Import the transactions route

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

app.use("api/transactions", transactionsRoute);

// Set up the port from environment variables or default to 5001
// This allows the server to listen on a specific port defined in the environment variables or defaults to 5001. 
const PORT = process.env.PORT || 5001;


// Define routes
// This route handles the root path and responds with a welcome message.
app.get("/", (req, res) => {
    res.send("Welcome to the Transactions API");
});


// Initialize the database and start the server
initDB().then(() => {
    app.listen(PORT, () => {
    console.log('Database initialized successfully on port:', PORT);
    });
});