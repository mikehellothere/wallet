
import {sql} from '../config/db.js'; // Adjust the path as necessary


export async function getTransactionsByUserId(req, res) {
    
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
    
}

export async function createTransaction (req, res) {
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
}

export async function deleteTransaction (req, res) {
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
}

export async function getSummaryByUserId (req, res) {
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
}