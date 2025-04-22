const express = require('express');
const router = express.Router();
const pricesController = require('../controllers/pricesController');

router.get('/', pricesController.create);

router.get('/prices', async (req, res) => {
    try {
        res.json(await pricesController.getMultiple(req.query.page || 1));
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;