const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { protect } = require('./middleware/authMiddleware');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());

// Logger de Requests (para auditoría básica)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} | User: ${req.headers.authorization ? 'Auth' : 'Guest'}`);
    next();
});

// Importar Rutas
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const userRoutes = require('./routes/users');
const studioRoutes = require('./routes/studios');
const accountingRoutes = require('./routes/accounting');
const taskRoutes = require('./routes/tasks');
const messageRoutes = require('./routes/messages');
const supplierRoutes = require('./routes/suppliers');
const planRoutes = require('./routes/plans');
const settingsRoutes = require('./routes/settings');

// Definir Rutas API
app.use('/api/auth', authRoutes);

// Rutas Protegidas (Multi-Tenant)
app.use('/api/projects', protect, projectRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/studios', protect, studioRoutes);
app.use('/api/accounting', protect, accountingRoutes);
app.use('/api/tasks', protect, taskRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api/suppliers', protect, supplierRoutes);

// Rutas Global Admin
app.use('/api/plans', protect, planRoutes);
app.use('/api/settings', protect, settingsRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(), 
        service: 'Vitrus PM Backend Multi-Tenant',
        version: '2.1.0'
    });
});

// Manejo Global de Errores
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ 
        message: 'Error Interno del Servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor Vitrus PM corriendo en puerto ${PORT}`);
    console.log(`   - Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Multi-Tenant: ACTIVO`);
});
