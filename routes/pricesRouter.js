const express = require('express');
const router = express.Router();
const pricesController = require('../controllers/pricesController');

router.get('/', async (req, res) => {
    try {
        res.json(await pricesController.create());
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/prices', async (req, res) => {
    try {
        const items = req.body
        
        
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }
        if (items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }
        
        res.json(await pricesController.getMultiple(items));
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;