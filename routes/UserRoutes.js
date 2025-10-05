const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/UserValidator');

const { VerifyToken } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, Disable, Enable } = require('../controllers/UserController');

router.get('/', GetAll);
router.post('/', VerifyToken, ValidateForm(true), Create);
router.post('/:id/update', VerifyToken, ValidateForm(false), Update);
router.post('/:id/disable', VerifyToken, Disable);
router.post('/:id/enable', VerifyToken, Enable);

module.exports = router;