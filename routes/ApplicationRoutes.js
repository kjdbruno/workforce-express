const express = require('express');
const router = express.Router();

// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
const upload = require("../middlewares/Upload");

const { ValidateForm } = require('../middlewares/ApplicationValidator');

const { VerifyToken } = require('../middlewares/AuthMiddleware');

const { GetAll, Create, Update, Disable, Enable } = require('../controllers/ApplicationController');

router.get('/', VerifyToken, GetAll);
router.post('/', upload.any(), VerifyToken, ValidateForm(), Create);
router.post('/:id/update', VerifyToken, ValidateForm(), Update);
router.post('/:id/disable', VerifyToken, Disable);
router.post('/:id/enable', VerifyToken, Enable);

module.exports = router;