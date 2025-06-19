const express = require('express');
const router = express.Router();

// const { verifyToken } = require('../middlewares/AuthMiddleware');
// const { validateForm } = require('../middlewares/AccountValidator');

// router.get('/', verifyToken, getAllAccounts);
// router.post('/', validateForm, verifyToken, createAccount);
// router.put('/:id', validateForm, verifyToken, updateAccount);
// router.post('/:id/disable', verifyToken, disableAccount);
// router.post('/:id/enable', verifyToken, enableAccount);

// module.exports = router;

const { validateApiKey } = require('../middlewares/AuthMiddleware');

module.exports = (KioskRatingController) => {
    
    const router = express.Router();
  
    router.post('/kiosk', validateApiKey, KioskRatingController.createKioskRating);
  
    return router;
    
};