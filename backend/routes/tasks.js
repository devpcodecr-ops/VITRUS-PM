const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/tasks (Opcional: ?project_id=X)
router.get('/', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        const projectId = req.query.project_id;
        
        let query = `
            SELECT t.*, u.first_name as assignee_name, p.name as project_name 
            FROM tasks t 
            LEFT JOIN users u ON t.assigned_to = u.id 
            JOIN projects p ON t.project_id = p.id
            WHERE t.studio_id = ?`;
        
        const params = [studioId];

        if (projectId) {
            query += ' AND t.project_id = ?';
            params.push(projectId);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error obteniendo tareas' });
    }
});

// POST /api/tasks
router.post('/', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        const { project_id, title, description, assigned_to, priority, due_date } = req.body;

        // Validar que el proyecto pertenece al mismo studio
        const [projectCheck] = await db.query('SELECT id FROM projects WHERE id = ? AND studio_id = ?', [project_id, studioId]);
        if (projectCheck.length === 0) {
            return res.status(403).json({ message: 'Proyecto inválido o acceso denegado' });
        }

        const [result] = await db.query(
            `INSERT INTO tasks (project_id, studio_id, title, description, assigned_to, priority, due_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [project_id, studioId, title, description, assigned_to, priority || 'medium', due_date]
        );

        res.status(201).json({ id: result.insertId, title, status: 'pending' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creando tarea' });
    }
});

module.exports = router;