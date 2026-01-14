// routes/faceRoutes.js
const express = require('express');
const router = express.Router();
const faceController = require('../controllers/FaceController');

// Routes
router.post('/register', faceController.registerFace);
router.post('/scan', faceController.scanFace);
router.get('/', faceController.getFaces);
router.get('/logs', faceController.getLogs);

module.exports = router;
