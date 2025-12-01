const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authorize } = require('../middleware/authMiddleware');

// Middleware: Solo Admin Global puede gestionar planes
router.use(authorize('admin_global'));

// GET /api/plans
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM plans ORDER BY price ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error obteniendo planes' });
    }
});

// POST /api/plans
router.post('/', async (req, res) => {
    try {
        const { name, price, max_users, max_projects, max_storage_gb } = req.body;
        
        if (!name || price === undefined) {
            return res.status(400).json({ message: 'Nombre y precio son obligatorios' });
        }

        const [result] = await db.query(
            'INSERT INTO plans (name, price, max_users, max_projects, max_storage_gb) VALUES (?, ?, ?, ?, ?)',
            [name, price, max_users, max_projects, max_storage_gb]
        );
        
        const [newPlan] = await db.query('SELECT * FROM plans WHERE id = ?', [result.insertId]);
        res.status(201).json(newPlan[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creando plan' });
    }
});

// PUT /api/plans/:id
router.put('/:id', async (req, res) => {
    try {
        const planId = req.params.id;
        const { name, price, max_users, max_projects, max_storage_gb, is_active } = req.body;

        await db.query(
            'UPDATE plans SET name = ?, price = ?, max_users = ?, max_projects = ?, max_storage_gb = ?, is_active = ? WHERE id = ?',
            [name, price, max_users, max_projects, max_storage_gb, is_active, planId]
        );

        const [updatedPlan] = await db.query('SELECT * FROM plans WHERE id = ?', [planId]);
        res.json(updatedPlan[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error actualizando plan' });
    }
});

// DELETE /api/plans/:id
router.delete('/:id', async (req, res) => {
    try {
        const planId = req.params.id;

        // Verificar si hay estudios usando este plan
        const [studios] = await db.query('SELECT COUNT(*) as count FROM studios WHERE plan_id = ?', [planId]);
        if (studios[0].count > 0) {
            return res.status(400).json({ message: 'No se puede eliminar un plan que está siendo utilizado por estudios activos.' });
        }

        await db.query('DELETE FROM plans WHERE id = ?', [planId]);
        res.json({ message: 'Plan eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error eliminando plan' });
    }
});

module.exports = router;
