const express = require('express');
const router = express.Router();

const { ValidateForm } = require('../middlewares/EmploymentStatusValidator');

const { VerifyToken } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, Disable, Enable } = require('../controllers/EmploymentStatusController');

router.get('/', VerifyToken, GetAll);
router.post('/', VerifyToken, ValidateForm(), Create);
router.post('/:id/update', VerifyToken, ValidateForm(), Update);
router.post('/:id/disable', VerifyToken, Disable);
router.post('/:id/enable', VerifyToken, Enable);

module.exports = router;