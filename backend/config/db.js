const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'vitruspm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Z'
});

// Verificar conexión al inicio
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
    } else {
        console.log('✅ Conectado a MySQL Base de Datos');
        connection.release();
    }
});

module.exports = pool.promise();
