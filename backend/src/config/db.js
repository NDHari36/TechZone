require('dotenv').config(); 
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'TechZone',
    waitForConnections: true,
    connectionLimit: 10, // Tối đa 10 kết nối cùng lúc
    queueLimit: 0
});

module.exports = pool.promise();