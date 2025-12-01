const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authorize } = require('../middleware/authMiddleware');

// Middleware: Solo Admin Global puede acceder a estas rutas
router.use(authorize('admin_global'));

// GET /api/studios
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, p.name as plan_name, 
            (SELECT COUNT(*) FROM users u WHERE u.studio_id = s.id) as user_count,
            (SELECT COUNT(*) FROM projects pr WHERE pr.studio_id = s.id) as project_count
            FROM studios s
            LEFT JOIN plans p ON s.plan_id = p.id
            ORDER BY s.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error obteniendo estudios' });
    }
});

// POST /api/studios
router.post('/', async (req, res) => {
    try {
        const { name, email, plan_id } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO studios (name, email, plan_id, subscription_status) VALUES (?, ?, ?, ?)',
            [name, email, plan_id || 1, 'active']
        );
        
        res.status(201).json({ id: result.insertId, message: 'Estudio creado exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creando estudio' });
    }
});

module.exports = router;