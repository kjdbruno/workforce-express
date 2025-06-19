const express = require('express');
const router = express.Router();

const { getAllUsers, createUser, updateUser, disableUser, enableUser } = require('../controllers/UserController');
const { verifyToken } = require('../middlewares/AuthMiddleware');
const { validateForm } = require('../middlewares/UserValidator');

router.get('/', verifyToken, getAllUsers);
router.post('/', verifyToken, validateForm(true),createUser);
router.post('/:id/update', verifyToken, validateForm(false), updateUser);
router.post('/:id/disable', verifyToken, disableUser);
router.post('/:id/enable', verifyToken, enableUser);

module.exports = router;