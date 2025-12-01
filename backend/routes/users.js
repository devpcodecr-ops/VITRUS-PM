const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const { studioId, role } = req.user;
        let query, params;

        if (role === 'admin_global') {
            // Admin Global ve todos los usuarios y sus estudios
            query = `
                SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, s.name as studio_name, u.studio_id 
                FROM users u 
                LEFT JOIN studios s ON u.studio_id = s.id 
                ORDER BY u.created_at DESC`;
            params = [];
        } else {
            // Otros roles solo ven usuarios de SU studio
            query = `
                SELECT id, email, first_name, last_name, role, is_active, studio_id 
                FROM users 
                WHERE studio_id = ? 
                ORDER BY created_at DESC`;
            params = [studioId];
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error obteniendo usuarios' });
    }
});

// POST /api/users
router.post('/', async (req, res) => {
    try {
        const { email, password, first_name, last_name, role } = req.body;
        
        // Determinar studio_id
        let targetStudioId = req.user.studioId;

        // Admin global puede crear usuarios para otros estudios si especifica studio_id en body
        if (req.user.role === 'admin_global' && req.body.studio_id) {
            targetStudioId = req.body.studio_id;
        }

        // Validación básica
        if (!email || !password || !first_name || !role) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar usuario
        const [result] = await db.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role, studio_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [email, passwordHash, first_name, last_name, role, targetStudioId]
        );

        res.status(201).json({ id: result.insertId, email, first_name, role, studio_id: targetStudioId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        console.error(err);
        res.status(500).json({ message: 'Error creando usuario' });
    }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { first_name, last_name, role, is_active, password } = req.body;
        const { studioId, role: userRole } = req.user;

        // 1. Verificar permisos
        let queryCheck = 'SELECT id, studio_id FROM users WHERE id = ?';
        let paramsCheck = [userId];

        if (userRole !== 'admin_global') {
            // Admin Estudio solo puede editar usuarios de su propio estudio
            queryCheck += ' AND studio_id = ?';
            paramsCheck.push(studioId);
        }

        const [userExists] = await db.query(queryCheck, paramsCheck);
        if (userExists.length === 0) {
            return res.status(403).json({ message: 'Usuario no encontrado o sin permisos' });
        }

        // 2. Construir query de actualización dinámica
        let updateQuery = 'UPDATE users SET first_name = ?, last_name = ?, role = ?, is_active = ?';
        let updateParams = [first_name, last_name, role, is_active];

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            updateQuery += ', password_hash = ?';
            updateParams.push(passwordHash);
        }

        updateQuery += ' WHERE id = ?';
        updateParams.push(userId);

        await db.query(updateQuery, updateParams);
        
        res.json({ message: 'Usuario actualizado correctamente' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error actualizando usuario' });
    }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    try {
        const userIdToDelete = req.params.id;
        const { studioId, role, id: currentUserId } = req.user;

        // No borrarse a sí mismo
        if (parseInt(userIdToDelete) === parseInt(currentUserId)) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
        }

        // 1. Verificar permisos
        let queryCheck = 'SELECT id FROM users WHERE id = ?';
        let paramsCheck = [userIdToDelete];

        if (role !== 'admin_global') {
            queryCheck += ' AND studio_id = ?';
            paramsCheck.push(studioId);
        }

        const [userExists] = await db.query(queryCheck, paramsCheck);
        if (userExists.length === 0) {
            return res.status(403).json({ message: 'Usuario no encontrado o sin permisos' });
        }

        // 2. Eliminar
        await db.query('DELETE FROM users WHERE id = ?', [userIdToDelete]);
        
        res.json({ message: 'Usuario eliminado correctamente' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error eliminando usuario' });
    }
});

module.exports = router;