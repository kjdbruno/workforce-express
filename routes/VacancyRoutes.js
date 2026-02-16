const express = require('express');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');

module.exports = (VacancyController) => {
    const router = express.Router();

    router.post('/create', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), VacancyController.CreateVacancy);

    return router;
};