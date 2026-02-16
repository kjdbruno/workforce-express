const { Op } = require("sequelize");
const os = require("os");

const pug = require('pug');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment');
const transporter = require('../utils/mailer');

const db = require('../models');
const { count } = require("console");
const { sequelize } = db;

let io;

const GetApplicant = async (id) => {
    return await db.Applicant.findOne({
        include: [
            {
                model: db.ApplicantDocument,
                as: 'documents',
                attributes: [
                    'filename', 'document'
                ]
            },
            {
                model: db.ApplicantEducation,
                as: 'educations',
                attributes: [
                    'school_level', 'start_date', 'end_date'
                ],
                include: [
                    {
                        model: db.School,
                        as: 'school',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: db.Course,
                        as: 'course',
                        attributes: [
                            'name'
                        ]
                    },
                ]
            },
            {
                model: db.ApplicantTraining,
                as: 'trainings',
                attributes: [
                    'title', 'type', 'start_date', 'end_date', 'hour'
                ]
            },
            {
                model: db.ApplicantExperience,
                as: 'experiences',
                attributes: [
                    'position', 'start_date', 'end_date', 'description'
                ]
            },
            {
                model: db.Vacancy,
                as: 'vacancy',
                include: [
                    {
                        model: db.Position,
                        as: 'position',
                        attributes: [
                            'name',
                            'salary_type',
                            'description',
                            'qualification',
                            [
                                sequelize.literal(`
                                    CASE
                                        WHEN ${sequelize.getQueryInterface().quoteIdentifier('vacancy->position')}.${sequelize.getQueryInterface().quoteIdentifier('salary_type')} = 'Monthly'
                                        THEN ${sequelize.getQueryInterface().quoteIdentifier('vacancy->position')}.${sequelize.getQueryInterface().quoteIdentifier('monthly_salary')}
                                        WHEN ${sequelize.getQueryInterface().quoteIdentifier('vacancy->position')}.${sequelize.getQueryInterface().quoteIdentifier('salary_type')} = 'Daily'
                                        THEN ${sequelize.getQueryInterface().quoteIdentifier('vacancy->position')}.${sequelize.getQueryInterface().quoteIdentifier('daily_salary')}
                                        WHEN ${sequelize.getQueryInterface().quoteIdentifier('vacancy->position')}.${sequelize.getQueryInterface().quoteIdentifier('salary_type')} = 'Hourly'
                                        THEN ${sequelize.getQueryInterface().quoteIdentifier('vacancy->position')}.${sequelize.getQueryInterface().quoteIdentifier('hourly_salary')}
                                        ELSE NULL
                                    END
                                `),
                                'salary_amount'
                            ]
                        ],
                        include: [
                            {
                                model: db.Department,
                                as: 'department',
                                attributes: [
                                    'name'
                                ]
                            },
                        ]
                    },
                    {
                        model: db.Shift,
                        as: 'shift',
                        include: [
                            {
                                model: db.ShiftDay,
                                as: 'days'
                            }
                        ]
                    }
                ]
            }
        ],
        where: {
            id
        }
    });
};

module.exports = (_io) => {
    io = _io;

    return {
        CreateVacancy: async (req, res) => {

            const { 
                positionId,
                shiftId,
                date,
                location,
                movement,
                justification,
                needBackgroundCheck,
                employmentStatus
            } = req.body;

            const transaction = await sequelize.transaction();

            try {

                const sign = await db.ApprovalSetting.findOne({
                    where: {
                        owner_id: req.user.id,
                        type: 'Vacancy',
                        order: 1,
                        is_active: true
                    },
                    transaction
                });
                if (!sign) {
                    await transaction.rollback();
                    return res.status(400).json({ error: "Approval setting not found for this document type and owner!" });
                }

                const year = new Date().getFullYear().toString();
                const latest = await db.Vacancy.findOne({
                    where: { 
                        control_no: { 
                            [Op.like]: `${year}-%` 
                        } 
                    },
                    order: [['control_no', 'DESC']]
                });
                let nextSeq = 1;
        
                if (latest) {
                    const lastSeq = parseInt(latest.control_no.split('-')[1]);
                    nextSeq = lastSeq + 1;
                }
                const newNo = `${year}-${String(nextSeq).padStart(3, '0')}`;
        
                const vacancy = await db.Vacancy.create({
                    control_no: newNo,
                    position_id: positionId,
                    shift_id: shiftId,
                    date_needed: date,
                    location,
                    movement,
                    justification,
                    need_background_check: needBackgroundCheck,
                    employment_status: employmentStatus,
                    status: 'Requested'
                }, { transaction });
        
                await db.Position.update(
                    { status: 'Requested' },
                    { where: { id: positionId }, transaction }
                );
        
        
                // Fetch approval settings by document type
                const signatories = await db.ApprovalSetting.findAll({
                    where: {
                        owner_id: req.user.id,
                        type: 'Vacancy',
                        is_active: true
                    },
                    order: [['order', 'ASC']]
                });
                for (const sig of signatories) {
                    const isFirstApprover = sig.order === 1;
                    await db.Approval.create({
                        setting_id: sig.id,
                        document_id: vacancy.id,
                        status: isFirstApprover ? 'Approved' : 'Pending',
                        signed_at: isFirstApprover ? new Date() : null,
                        remarks: isFirstApprover ? 'Auto-approved (owner is first approver)' : null,
                        is_active: true
                    }, { transaction });

                    /**
                     * Notification to approver
                     */
                    await db.Notification.create({
                        sender_id: req.user?.id,
                        receiver_id: sig.approver_id,
                        content: `New vacancy request (${vacancy.control_no}) requires your approval.`,
                        status: 'unread'
                    });

                    const [notificationCount, notifications] = await Promise.all([
                        db.Notification.count({
                        where: { receiver_id: sig.approver_id, status: 'unread' }
                        }),
                        db.Notification.findAll({
                        where: { receiver_id: sig.approver_id, status: 'unread' },
                        order: [['createdAt', 'DESC']]
                        })
                    ]);

                    // ✅ send ONLY to this user
                    io.to(`user:${sig.approver_id}`).emit('EmitNotifications', {
                        notifications,
                        count: notificationCount,
                    });
                }
        
                await transaction.commit();
        
                res.status(201).json({
                    message: "Record Saved!"
                });
                
            } catch (error) {
                console.error("Error creating vacancy:", error);
                await transaction.rollback();
                res.status(400).json({ 
                    error: error.message 
                });
            }
        },
        ApproveVacancy: async (req, res) => {

            const id = parseInt(req.body.id, 10);
            const approvalid = parseInt(req.body.approvalid, 10);

            const transaction = await sequelize.transaction();

            try {

                if (!id || !approvalid) {
                    await transaction.rollback();
                    return res.status(400).json({ error: "Missing required id / approvalid." });
                }
        
                // 1️ Fetch vacancy (inside transaction)
                const vacancy = await db.Vacancy.findByPk(id, { transaction });
        
                if (!vacancy) {
                    await transaction.rollback();
                    return res.status(404).json({
                        errors: [
                            {
                                type: "field",
                                value: id,
                                msg: "Record not found!",
                                path: "id",
                                location: "body",
                            },
                        ],
                    });
                }
        
                // 2️ Fetch approval (must belong to this document)
                const approval = await db.Approval.findOne({
                    where: {
                        id: approvalid,
                        document_id: id,
                        is_active: true,
                    },
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });
        
                if (!approval) {
                    await transaction.rollback();
                    return res.status(404).json({ error: "Approval record not found for this document!" });
                }
        
                // if already approved, just return OK (idempotent)
                if (approval.status !== "Approved") {
                    await approval.update(
                        { status: "Approved", signed_at: new Date() }, // remove signed_at if you don't have it
                        { transaction }
                    );
                }
        
                const totalCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'Vacancy'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true
                    },
                    transaction
                });
        
                const approvedCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'Vacancy'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true,
                        status: 'Approved'
                    },
                    transaction
                });
        
                // 4️ If all approvals done, approve vacancy + approve position
                if (totalCount === approvedCount) {
                    await vacancy.update({ status: "Approved" }, { transaction });
        
                    await db.Position.update(
                        { status: "Approved" },
                        { where: { id: vacancy.position_id }, transaction }
                    );
                }

                // 5 send notification to  hr and the requestor that the vacancy is approved
                const users = await db.User.findAll({
                    where: {
                        role: {
                            [Op.in]: ['SuperAdmin', 'Admin', 'Management', 'HR']
                        }
                    }
                });
                for (const emp of users) {
                    await db.Notification.create({
                        sender_id: req.user?.id,
                        receiver_id: emp.id,
                        content:`Vacancy request (${vacancy.control_no}) has been approved. Current status: ${vacancy.status}.`,
                        status: 'unread'
                    });

                    const [notificationCount, notifications] = await Promise.all([
                        db.Notification.count({
                        where: { receiver_id: emp.id, status: 'unread' }
                        }),
                        db.Notification.findAll({
                        where: { receiver_id: emp.id, status: 'unread' },
                        order: [['createdAt', 'DESC']]
                        })
                    ]);

                    // ✅ send ONLY to this user
                    io.to(`user:${emp.id}`).emit('EmitNotifications', {
                        notifications,
                        count: notificationCount,
                    });
                }

                await transaction.commit();

                return res.status(200).json({
                    message: "Record Saved!"
                });
                
            } catch (error) {
                console.error("Error creating vacancy:", error);
                await transaction.rollback();
                res.status(400).json({ 
                    error: error.message 
                });
            }
        },
        OverideVacancy: async (req, res) => {

            const { id, signatories } = req.body;

            const transaction = await sequelize.transaction();

            try {
                // ---- validate payload ----
                if (!Array.isArray(signatories) || signatories.length === 0) {
                    await transaction.rollback();
                    return res.status(400).json({
                        message: 'No signatories provided'
                    });
                }
        
                const approvalIds = [...new Set(
                    signatories
                        .map(id => Number(id))
                        .filter(id => Number.isInteger(id) && id > 0)
                )];
        
                if (approvalIds.length === 0) {
                    await transaction.rollback();
                    return res.status(400).json({
                        message: 'Invalid signatories payload'
                    });
                }
        
                // ---- fetch approvals (must belong to same document) ----
                const approvals = await db.Approval.findAll({
                    where: {
                        id: approvalIds,
                        is_active: true
                    },
                    transaction
                });
        
                if (approvals.length === 0) {
                    await transaction.rollback();
                    return res.status(404).json({
                        message: 'No approvals found to override'
                    });
                }
        
                // ---- update approvals as overridden ----
                await db.Approval.update(
                    {
                        status: 'Approved',
                        is_overide: true,
                        signed_at: new Date()
                    },
                    {
                        where: { id: approvalIds },
                        transaction
                    }
                );
        
                // ---- save override history ----
                await db.ApprovalOveride.bulkCreate(
                    approvalIds.map(id => ({
                        approval_id: id,
                        user_id: req.user.id
                    })),
                    { transaction }
                );
        
                const vacancy = await db.Vacancy.findByPk(id, { transaction });
        
                const totalCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'Vacancy'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true
                    },
                    transaction
                });
        
                const approvedCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'Vacancy'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true,
                        status: 'Approved'
                    },
                    transaction
                });
        
                // 4️ If all approvals done, approve vacancy + approve position
                if (totalCount === approvedCount) {
                    await vacancy.update({ status: "Approved" }, { transaction });
        
                    await db.Position.update(
                        { status: "Approved" },
                        { where: { id: vacancy.position_id }, transaction }
                    );
                }

                // 5 send notification to  hr and the requestor that the vacancy is approved
                const users = await db.User.findAll({
                    where: {
                        role: {
                            [Op.in]: ['SuperAdmin', 'Admin', 'Management', 'HR']
                        }
                    }
                });
                for (const emp of users) {
                    await db.Notification.create({
                        sender_id: req.user?.id,
                        receiver_id: emp.id,
                        content: `Vacancy request (${vacancy.control_no}) approval has been overridden. Current status: ${vacancy.status}.`,
                        status: 'unread'
                    });

                    const [notificationCount, notifications] = await Promise.all([
                        db.Notification.count({
                        where: { receiver_id: emp.id, status: 'unread' }
                        }),
                        db.Notification.findAll({
                        where: { receiver_id: emp.id, status: 'unread' },
                        order: [['createdAt', 'DESC']]
                        })
                    ]);

                    // ✅ send ONLY to this user
                    io.to(`user:${emp.id}`).emit('EmitNotifications', {
                        notifications,
                        count: notificationCount,
                    });
                }
        
                await transaction.commit();
        
                return res.status(200).json({
                message: 'Approval overridden successfully'
                });
        
            } catch (error) {
                await transaction.rollback();
                console.error(error);
                return res.status(500).json({
                message: 'Failed to override approval',
                error: error.message
                });
            }
        },
        /**
         * Application
         */
        CreateApplication: async (req, res) => {

            const {
                vacancyId, firstname, middlename, lastname, suffix,
                sex, civilstatus, birthdate, birthplace, email,
                contactNo, address, educations, trainings, experiences
            } = req.body;

            const mail = (email || '').toLowerCase();

            const files = req.files || [];
            const educ = JSON.parse(educations || "[]");
            const train = JSON.parse(trainings || "[]");
            const exp = JSON.parse(experiences || "[]");

            const transaction = await sequelize.transaction();
            let applicant; // so we can access after commit

            try {
                applicant = await db.Applicant.create({
                    vacancy_id: vacancyId,
                    first_name: firstname,
                    middle_name: middlename,
                    last_name: lastname,
                    suffix,
                    sex,
                    civil_status: civilstatus,
                    birthdate,
                    birthplace,
                    address,
                    contact_number: contactNo,
                    email
                }, { transaction });

                for (const edu of educ) {
                    await db.ApplicantEducation.create({
                        applicant_id: applicant.id,
                        school_level: edu.schoollevel,
                        school_id: edu.schoolId,
                        course_id: edu.courseId,
                        start_date: edu.startDate,
                        end_date: edu.endDate
                    }, { transaction });
                }

                for (const tr of train) {
                    await db.ApplicantTraining.create({
                        applicant_id: applicant.id,
                        title: tr.title,
                        type: tr.trainingtype,
                        start_date: tr.startDate,
                        end_date: tr.endDate,
                        hour: tr.hour
                    }, { transaction });
                }

                for (const ex of exp) {
                    await db.ApplicantExperience.create({
                        applicant_id: applicant.id,
                        position: ex.position,
                        start_date: ex.startDate,
                        end_date: ex.endDate,
                        description: ex.description
                    }, { transaction });
                }

                for (const file of files) {
                    const filePath = `/uploads/documents/${file.filename}`;
                    await db.ApplicantDocument.create({
                        applicant_id: applicant.id,
                        document: filePath,
                        filename: file.originalname
                    }, { transaction });
                }

                /**
                 * Send Notification
                 */
                const users = await db.User.findAll({
                    where: {
                        role: {
                            [Op.in]: ['SuperAdmin', 'Admin', 'Management', 'HR']
                        }
                    }
                });
                for (const emp of users) {
                    await db.Notification.create({
                        sender_id: req.user?.id,
                        receiver_id: emp.id,
                        content: `New application submitted for vacancy.`,
                        status: 'unread'
                    });

                    const [notificationCount, notifications] = await Promise.all([
                        db.Notification.count({
                        where: { receiver_id: emp.id, status: 'unread' }
                        }),
                        db.Notification.findAll({
                        where: { receiver_id: emp.id, status: 'unread' },
                        order: [['createdAt', 'DESC']]
                        })
                    ]);

                    // ✅ send ONLY to this user
                    io.to(`user:${emp.id}`).emit('EmitNotifications', {
                        notifications,
                        count: notificationCount,
                    });
                }

                await transaction.commit();
            } catch (error) {
                if (!transaction.finished) await transaction.rollback();
                return res.status(400).json({
                    message: "Failed to create record.",
                    error: error.message || String(error)
                });
            }
            
            const data = await GetApplicant(applicant.id);
            const position = data?.vacancy?.position?.name;

            // Email sending should not break the request
            try {
                const templatePath = path.join(__dirname, '../templates/NewApplication.html');
                let htmlContent = fs.readFileSync(templatePath, 'utf8');
                htmlContent = htmlContent
                .replace(/{{\s*firstname\s*}}/g, firstname || 'Applicant')
                .replace(/{{\s*position\s*}}/g, position || 'a position');

                await transporter.sendMail({
                    from: `"Recruitment Team" <${process.env.MAIL_USER}>`,
                    to: mail,
                    subject: 'Application Status: Considered for Talent Pooling',
                    html: htmlContent,
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError.message);
            }

            return res.status(201).json({
                message: "Record Saved!",
                application: data
            });

        },
        UpdateApplication: async (req, res) => {

            const { id, status } = req.body;

            const transaction = await sequelize.transaction();

            try {
                const application = await db.Applicant.findByPk(id);
                if (!application) {
                    await transaction.rollback();
                    return res.status(404).json({
                        errors: [{
                        type: "field",
                        value: status,
                        msg: "Record not found!",
                        path: "applicationstatus",
                        location: "body",
                        }],
                    });
                }

                await application.update({ status }, { transaction });

                const vacancy = await db.Vacancy.findByPk(application.vacancy_id, { transaction });
                if (!vacancy) {
                await transaction.rollback();
                    return res.status(404).json({
                        errors: [{
                        type: "field",
                        value: status,
                        msg: "Record not found!",
                        path: "applicationstatus",
                        location: "body",
                        }],
                    });
                }

                if (status === 'Hired') {
                    await vacancy.update({ status: 'Filled' }, { transaction });
                    await db.Position.update(
                        { status: 'Filled' },
                        { where: { id: vacancy.position_id }, transaction }
                    );
                }

                /**
                 * Send Notification
                 */
                const users = await db.User.findAll({
                    where: {
                        role: {
                            [Op.in]: ['SuperAdmin', 'Admin', 'Management', 'HR']
                        }
                    }
                });
                for (const emp of users) {
                   await db.Notification.create({
                        sender_id: req.user?.id,
                        receiver_id: emp.id,
                        content: `Application status updated to ${status}.`,
                        status: 'unread'
                    });

                    const [notificationCount, notifications] = await Promise.all([
                        db.Notification.count({
                        where: { receiver_id: emp.id, status: 'unread' }
                        }),
                        db.Notification.findAll({
                        where: { receiver_id: emp.id, status: 'unread' },
                        order: [['createdAt', 'DESC']]
                        })
                    ]);

                    // ✅ send ONLY to this user
                    io.to(`user:${emp.id}`).emit('EmitNotifications', {
                        notifications,
                        count: notificationCount,
                    });
                }

                await transaction.commit();

                // ✅ After commit: safe to fetch details + email
                const data = await GetApplicant(application.id);

                const templates = {
                    Shortlisted: { file: 'ShortlistedApplication.html', subject: 'Application Status: Shortlisted' },
                    Interview:   { file: 'InterviewApplication.html',   subject: 'Application Status: For Interview' },
                    Hired:       { file: 'HiredApplication.html',       subject: 'Application Status: Hired' },
                    Rejected:    { file: 'RejectedApplication.html',    subject: 'Application Status: Rejected' },
                    Withdrawn:   { file: 'WithdrawnApplication.html',   subject: 'Application Status: Withdrawn' },
                };

                const t = templates[status];

                if (t) {
                    try {
                        const email = data.email;
                        const firstname = data.first_name;
                        const position = data?.vacancy?.position?.name;

                        const templatePath = path.join(__dirname, '../templates', t.file);
                        let htmlContent = fs.readFileSync(templatePath, 'utf8');

                        htmlContent = htmlContent
                        .replace(/{{\s*firstname\s*}}/g, firstname || 'Applicant')
                        .replace(/{{\s*position\s*}}/g, position || 'a position');

                        await transporter.sendMail({
                            from: `"Recruitment Team" <${process.env.MAIL_USER}>`,
                            to: email,
                            subject: t.subject,
                            html: htmlContent,
                        });
                    } catch (emailError) {
                        console.error('Email sending failed:', emailError.message);
                    }
                }

                return res.status(200).json({
                    message: "Record Modified!",
                    application: data
                });

            } catch (error) {
                // ✅ prevent "rollback after commit" crash
                if (!transaction.finished) await transaction.rollback();

                return res.status(400).json({
                    error: error.message
                });
            }

        },
    };
};
