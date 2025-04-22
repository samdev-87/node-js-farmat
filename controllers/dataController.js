const db = require('../config/db');

exports.createData = (req, res) => {
    try {
        const { name, age } = req.body;
        const sql = 'INSERT INTO users (name, age) VALUES (?, ?)';
        db.query(sql, [name, age], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Data created successfully', id: result.insertId });
        });
    }
    catch (error) {
        console.error('Error in createData:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getData = (req, res) => {
    try {
        const sql = 'SELECT * FROM users';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json(results);
        });
    }
    catch (error) {
        console.error('Error in getData:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
