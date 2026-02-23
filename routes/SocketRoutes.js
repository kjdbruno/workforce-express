const express = require('express');

const { VerifyToken, AuthorizeRoles } = require('../middlewares/AuthMiddleware');
const UploadDocument = require("../middlewares/UploadDocument");

module.exports = (SocketController) => {
    const router = express.Router();

    // vacancy routes
    router.post('/vacancy/create', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), SocketController.CreateVacancy);
    router.post('/vacancy/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), SocketController.ApproveVacancy);
    router.post('/vacancy/overide', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), SocketController.OverideVacancy);

    // application routes
    router.post('/application/create', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), UploadDocument.any(), SocketController.CreateApplication);
    router.post('/application/update', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), SocketController.UpdateApplication);

    // leave routes
    router.post('/leave/create', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), SocketController.CreateLeaveApplication);
    router.post('/leave/:id/approve', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), SocketController.ApproveLeaveApplication);
    router.post('/leave/:id/overide', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), SocketController.OverideLeaveApplication);
    router.post('/leave/:id/cancel', VerifyToken, AuthorizeRoles('SuperAdmin', 'Admin', 'Management', 'HR'), SocketController.CancelLeaveApplication);

    return router;
};