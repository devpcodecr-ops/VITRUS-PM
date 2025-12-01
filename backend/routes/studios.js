const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authorize } = require('../middleware/authMiddleware');

// Middleware: Solo Admin Global puede acceder a estas rutas
router.use(authorize('admin_global'));

// GET /api/studios/stats (Global Dashboard Metrics)
// DEBE IR ANTES DE /:id
router.get('/stats', async (req, res) => {
    try {
        // 1. Total Estudios Activos
        const [studios] = await db.query('SELECT COUNT(*) as count FROM studios WHERE subscription_status = "active"');
        const activeStudios = studios[0].count;

        // 2. Total Usuarios
        const [users] = await db.query('SELECT COUNT(*) as count FROM users');
        const totalUsers = users[0].count;

        // 3. Total Proyectos
        const [projects] = await db.query('SELECT COUNT(*) as count FROM projects');
        const totalProjects = projects[0].count;

        // 4. MRR Real (Suma de precios de planes de estudios activos)
        const [revenue] = await db.query(`
            SELECT SUM(p.price) as mrr 
            FROM studios s
            JOIN plans p ON s.plan_id = p.id
            WHERE s.subscription_status = "active"
        `);
        const mrr = revenue[0].mrr || 0;

        // 5. Distribución de Ingresos por Plan
        const [revenueByPlan] = await db.query(`
            SELECT p.name, SUM(p.price) as value
            FROM studios s
            JOIN plans p ON s.plan_id = p.id
            WHERE s.subscription_status = "active"
            GROUP BY p.name
        `);

        // 6. Churn Rate (Simulado para demo, o calculado si hubiera histórico)
        const churnRate = 4.2; 

        // 7. Nuevas Suscripciones (Últimos 30 días)
        const [newSubs] = await db.query(`
            SELECT COUNT(*) as count FROM studios 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        res.json({
            activeStudios,
            totalUsers,
            totalProjects,
            mrr,
            churnRate,
            newSubscriptions: newSubs[0].count,
            revenueByPlan
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error calculando estadísticas globales' });
    }
});

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
        
        // Soft delete recomendado en producción, pero aquí usamos delete físico para el demo
        // Al tener ON DELETE CASCADE en el schema, borrar el studio borra todo lo demás
        await db.query('DELETE FROM studios WHERE id = ?', [studioId]);

        res.json({ message: 'Estudio eliminado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error eliminando estudio' });
    }
});

module.exports = router;
