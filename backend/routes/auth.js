const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor ingrese email y contraseña' });
    }

    try {
        // 1. Buscar usuario
        const [users] = await db.query(
            'SELECT id, email, password_hash, first_name, last_name, role, studio_id, is_active FROM users WHERE email = ?', 
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // 2. Validar contraseña usando bcryptjs
        // Si el hash en BD es un string simple (para demo), comparamos directo.
        // Si empieza con $, asumimos que es bcrypt.
        let isMatch = false;
        
        if (user.password_hash.startsWith('$')) {
             isMatch = await bcrypt.compare(password, user.password_hash);
        } else {
             // Fallback para datos legacy o seed simple
             isMatch = (password === user.password_hash);
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Cuenta desactivada. Contacte a soporte.' });
        }

        // 3. Generar JWT con Payload Multi-Tenant
        const token = jwt.sign(
            { 
                userId: user.id, 
                studioId: user.studio_id, // CRÍTICO: Identidad del Tenant
                role: user.role,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 4. Retornar respuesta
        res.json({
            token,
            user: {
                id: user.id,
                studio_id: user.studio_id,
                name: `${user.first_name} ${user.last_name || ''}`.trim(),
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;