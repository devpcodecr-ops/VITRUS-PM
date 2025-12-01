const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/projects
// Lista proyectos filtrando estrictamente por studio_id del usuario
router.get('/', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        const role = req.user.role;
        
        let query;
        let params;

        if (role === 'admin_global') {
            // Admin Global puede ver todo, o filtrar si quisiera
            query = 'SELECT p.*, s.name as studio_name FROM projects p JOIN studios s ON p.studio_id = s.id ORDER BY p.created_at DESC';
            params = [];
        } else {
            // CRÍTICO: Admin Estudio y Colaboradores SOLO ven su tenant
            query = 'SELECT * FROM projects WHERE studio_id = ? ORDER BY created_at DESC';
            params = [studioId];
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener proyectos' });
    }
});

// POST /api/projects
// Crea proyecto asignando automáticamente el studio_id del token
router.post('/', async (req, res) => {
    try {
        const { name, description, client_name, budget, start_date, end_date } = req.body;
        const studioId = req.user.studioId; // Extraído del token, seguro.

        if (!name) {
            return res.status(400).json({ message: 'El nombre del proyecto es obligatorio' });
        }

        // Insertar asegurando studio_id
        const [result] = await db.query(
            `INSERT INTO projects 
            (studio_id, name, description, client_name, budget, start_date, end_date, status, progress) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'planning', 0)`,
            [studioId, name, description, client_name, budget, start_date, end_date]
        );

        const [newProject] = await db.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);

        res.status(201).json(newProject[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al crear proyecto' });
    }
});

// GET /api/projects/:id
// Obtiene detalle validando pertenencia al tenant
router.get('/:id', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        const projectId = req.params.id;
        const role = req.user.role;

        let query = 'SELECT * FROM projects WHERE id = ?';
        let params = [projectId];

        // Si NO es admin global, agregar cláusula AND studio_id
        if (role !== 'admin_global') {
            query += ' AND studio_id = ?';
            params.push(studioId);
        }

        const [rows] = await db.query(query, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proyecto no encontrado o acceso denegado' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;
