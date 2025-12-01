const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/messages
router.get('/', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        const userId = req.user.id;
        
        // Obtener mensajes donde el usuario es remitente o destinatario
        // Y asegurar que pertenecen al studio
        const [rows] = await db.query(`
            SELECT m.*, 
            s.first_name as sender_name, 
            r.first_name as recipient_name 
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.recipient_id = r.id
            WHERE m.studio_id = ? 
            AND (m.sender_id = ? OR m.recipient_id = ?)
            ORDER BY m.created_at DESC
        `, [studioId, userId, userId]);
        
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo mensajes' });
    }
});

// POST /api/messages
router.post('/', async (req, res) => {
    try {
        const studioId = req.user.studioId;
        const senderId = req.user.id;
        const { recipient_id, content } = req.body;

        // Validar que destinatario es del mismo studio
        const [userCheck] = await db.query('SELECT id FROM users WHERE id = ? AND studio_id = ?', [recipient_id, studioId]);
        if (userCheck.length === 0) {
            return res.status(400).json({ message: 'Usuario destinatario no encontrado en este estudio' });
        }

        await db.query(
            'INSERT INTO messages (studio_id, sender_id, recipient_id, content) VALUES (?, ?, ?, ?)',
            [studioId, senderId, recipient_id, content]
        );

        res.status(201).json({ message: 'Mensaje enviado' });
    } catch (err) {
        res.status(500).json({ message: 'Error enviando mensaje' });
    }
});

module.exports = router;