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
        
        if (!name) {
             return res.status(400).json({ message: 'El nombre es obligatorio' });
        }

        const [result] = await db.query(
            'INSERT INTO studios (name, email, plan_id, subscription_status) VALUES (?, ?, ?, ?)',
            [name, email, plan_id || 1, 'active']
        );
        
        // Devolver el estudio creado
        const [newStudio] = await db.query('SELECT * FROM studios WHERE id = ?', [result.insertId]);
        res.status(201).json(newStudio[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creando estudio' });
    }
});

// PUT /api/studios/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, email, plan_id, subscription_status } = req.body;
        const studioId = req.params.id;

        await db.query(
            'UPDATE studios SET name = ?, email = ?, plan_id = ?, subscription_status = ? WHERE id = ?',
            [name, email, plan_id, subscription_status, studioId]
        );

        const [updatedStudio] = await db.query('SELECT * FROM studios WHERE id = ?', [studioId]);
        res.json(updatedStudio[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error actualizando estudio' });
    }
});

// DELETE /api/studios/:id
router.delete('/:id', async (req, res) => {
    try {
        const studioId = req.params.id;
        
        // Opcional: Soft delete o validación de dependencias
        // Por ahora, eliminamos físicamente para el CRUD completo
        
        // Primero eliminar dependencias (o configurar ON DELETE CASCADE en DB)
        // Nota: En producción real, se recomienda soft-delete (is_active = false)
        await db.query('DELETE FROM users WHERE studio_id = ?', [studioId]);
        await db.query('DELETE FROM projects WHERE studio_id = ?', [studioId]);
        await db.query('DELETE FROM studios WHERE id = ?', [studioId]);

        res.json({ message: 'Estudio eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error eliminando estudio' });
    }
});

module.exports = router;