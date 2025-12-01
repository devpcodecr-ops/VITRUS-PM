const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authorize } = require('../middleware/authMiddleware');

// Middleware: Solo Admin Global puede gestionar configuración
router.use(authorize('admin_global'));

// GET /api/settings
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT setting_key, setting_value FROM settings');
        // Convertir array de key-values a un objeto JSON simple
        const settings = rows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error obteniendo configuración' });
    }
});

// PUT /api/settings
router.put('/', async (req, res) => {
    try {
        const settings = req.body; // Objeto { key: value, key2: value2 }
        
        const promises = Object.entries(settings).map(([key, value]) => {
            return db.query(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        });

        await Promise.all(promises);
        
        res.json({ message: 'Configuración actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error actualizando configuración' });
    }
});

module.exports = router;
