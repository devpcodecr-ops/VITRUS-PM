const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/accounting/invoices
router.get('/invoices', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        const [rows] = await db.query(
            'SELECT * FROM invoices WHERE studio_id = ? ORDER BY issue_date DESC', 
            [studioId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo facturas' });
    }
});

// GET /api/accounting/expenses
router.get('/expenses', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        const [rows] = await db.query(
            'SELECT * FROM expenses WHERE studio_id = ? ORDER BY date DESC', 
            [studioId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo gastos' });
    }
});

// GET /api/accounting/reports
router.get('/reports', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        
        // Totales simples
        const [invoices] = await db.query('SELECT SUM(amount) as total FROM invoices WHERE studio_id = ? AND status = "paid"', [studioId]);
        const [expenses] = await db.query('SELECT SUM(amount) as total FROM expenses WHERE studio_id = ?', [studioId]);
        
        res.json({
            income: invoices[0].total || 0,
            expenses: expenses[0].total || 0,
            net: (invoices[0].total || 0) - (expenses[0].total || 0)
        });
    } catch (err) {
        res.status(500).json({ message: 'Error generando reporte' });
    }
});

module.exports = router;