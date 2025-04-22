const mysql = require('mysql2/promise'); // Use mysql2 for promise support

const db = await mysql.createConnection({
    host: 'localhost', 
    user: 'root',      
    password: '',      
    database: 'testdb'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = db;