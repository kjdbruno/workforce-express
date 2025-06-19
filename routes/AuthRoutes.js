const express = require('express');

const { validateForm } = require('../middlewares/AuthValidator');

module.exports = (AuthController) => {
    const router = express.Router();
  
    router.post('/login', validateForm, AuthController.login);
    router.post('/logout', AuthController.logout);
    router.get('/check-token', AuthController.checkToken);
  
    return router;
};