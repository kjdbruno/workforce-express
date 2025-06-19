const express = require('express');
const router = express.Router();

const { getAllFeedbacks, createFeedbackKiosk, getAllRatings, generatePDFRating } = require('../controllers/FeedbackController');
const { verifyToken, validateApiKey } = require('../middlewares/AuthMiddleware');
const { validateForm } = require('../middlewares/OfficeValidator');

router.get('/', verifyToken, getAllFeedbacks);
router.post('/kiosk', verifyToken, createFeedbackKiosk);
router.get('/:id/:year', verifyToken, getAllRatings);
router.get('/pdf/rating/:id', verifyToken, generatePDFRating);

module.exports = router;