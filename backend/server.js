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

// Definir Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/projects', protect, projectRoutes); // Protegido globalmente

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(), 
        service: 'Vitrus PM Backend Multi-Tenant' 
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
