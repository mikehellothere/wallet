import express from 'express';
import {createTransaction, deleteTransaction, getSummaryByUserId, getTransactionsByUserId} from '../../../controllers/transactionsController.js'; // Adjust the path as necessary


const router = express.Router();


// This route fetches all transactions for a specific user by userId
router.get("/:userId", getTransactionsByUserId);

// This route handles the creation of a new transaction
router.post("/", createTransaction);

// This route handles deleting a transaction by its ID 
router.delete("/:id", deleteTransaction);

// This route fetches a summary of transactions for a specific user
router.get("/summary/:userId", getSummaryByUserId);

export default router;