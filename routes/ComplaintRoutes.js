const express = require('express');
const router = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const { verifyToken, validateApiKey } = require('../middlewares/AuthMiddleware');

module.exports = (ComplaintController) => {
    
    const router = express.Router();
  
    router.post('/otp/send', upload.array('photos'), validateApiKey, ComplaintController.sendOTP);
    router.post('/otp/validate', validateApiKey, ComplaintController.validateOTP);
    router.post('/', verifyToken, ComplaintController.createComplaint);
    router.get('/', verifyToken, ComplaintController.getAllComplaints);
  
    return router;
    
};