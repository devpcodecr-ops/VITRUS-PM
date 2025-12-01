const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/suppliers
router.get('/', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        const [rows] = await db.query('SELECT * FROM suppliers WHERE studio_id = ?', [studioId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo proveedores' });
    }
});

// POST /api/suppliers
router.post('/', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        const { name, contact_name, email, phone, category, tax_id } = req.body;

        const [result] = await db.query(
            'INSERT INTO suppliers (studio_id, name, contact_name, email, phone, category, tax_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [studioId, name, contact_name, email, phone, category, tax_id]
        );
        res.status(201).json({ id: result.insertId, name });
    } catch (err) {
        res.status(500).json({ message: 'Error creando proveedor' });
    }
});

module.exports = router;