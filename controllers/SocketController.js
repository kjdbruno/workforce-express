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

// Common helpers (use as-is)
const pos = (n) => (n > 0 ? n : 0);

const combineDayTime = (workDay, timeStr) => {
    const t = (timeStr || "").trim();
    if (!t) return moment.invalid();
        const m = moment(`${workDay} ${t}`, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"], true);
    if (!m.isValid() && t.length === 5) {
        return moment(`${workDay} ${t}:00`, "YYYY-MM-DD HH:mm:ss", true);
    }
    return m;
};

const pickEffectiveEmployeeShift = (employeeShifts, workDayYMD) => {
    const day = moment(workDayYMD, "YYYY-MM-DD", true);
    const valid = (employeeShifts || [])
        .filter((es) => es.is_active)
        .filter((es) => {
            const from = moment(es.effective_from, "YYYY-MM-DD", true);
            const to = es.effective_to ? moment(es.effective_to, "YYYY-MM-DD", true) : null;
            return from.isSameOrBefore(day, "day") && (!to || to.isSameOrAfter(day, "day"));
        })
        .sort((a, b) => moment(b.effective_from).diff(moment(a.effective_from)));
    return valid[0] || null;
};

const overlapMinutes = (aStart, aEnd, bStart, bEnd) => {
    const start = moment.max(aStart, bStart);
    const end = moment.min(aEnd, bEnd);
    const diff = end.diff(start, "minutes");
    return diff > 0 ? diff : 0;
};

const getApprovedOvertimesForDay = async ({ employeeId, workDay, transaction }) => {
    return db.EmployeeOvertimeApplication.findAll({
        where: {
            employee_id: employeeId,
            status: "Approved",
        },
        include: [
            {
                model: db.Overtime,
                as: "overtime",
                required: true,
                where: {
                    date: workDay,
                    status: "Approved",
                    is_active: true,
                },
            },
        ],
        transaction,
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

                const year = new Date().getFullYear().toString();
                const latest = await db.Applicant.findOne({
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

                applicant = await db.Applicant.create({
                    control_no: newNo,
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

                const indexToDocumentId = {};
                for (const [key, value] of Object.entries(req.body || {})) {
                    const match = key.match(/^documents\[(\d+)\]\[documentId\]$/);
                    if (match) {
                        const idx = match[1];
                        indexToDocumentId[idx] = value;
                    }
                }
                for (const file of files) {
                    const match = file.fieldname.match(/^documents\[(\d+)\]\[file\]$/);
                    if (!match) continue;
                    await db.ApplicantDocument.create({
                        applicant_id: applicant.id,
                        document: file.buffer,
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
            const control_no = data?.control_no;

            // Email sending should not break the request
            try {
                const templatePath = path.join(__dirname, '../templates/NewApplication.html');
                let htmlContent = fs.readFileSync(templatePath, 'utf8');
                htmlContent = htmlContent
                .replace(/{{\s*control_no\s*}}/g, control_no || 'Control No')
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
                        const control_no = data?.control_no;

                        const templatePath = path.join(__dirname, '../templates', t.file);
                        let htmlContent = fs.readFileSync(templatePath, 'utf8');

                        htmlContent = htmlContent
                            .replace(/{{\s*control_no\s*}}/g, control_no || 'Control No')
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
        /**
         * Leave
         */
        CreateLeaveApplication: async (req, res) => {
            const { 
                employeeid,
                typeid,
                datestart,
                dateend,
                reason
            } = req.body;
        
            try {
                //control no
                const year = new Date().getFullYear().toString();
                const latest = await db.EmployeeLeaveApplication.findOne({
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
                
                // get employee userid
                const account = await db.EmployeeAccount.findOne({
                    where: { employee_id: employeeid },
                    include: [
                        {
                        model: db.User,
                        as: 'user',
                        required: true,
                        where: { role: 'Employee' },
                        },
                    ]
                });
        
                // save leave
                const leave = await db.EmployeeLeaveApplication.create({
                    employee_id: employeeid,
                    control_no: newNo,
                    leave_type_id: typeid,
                    date_from: datestart,
                    date_to: dateend,
                    reason,
                    status: 'Filed'
                });
        
                // Fetch approval settings by document type
                const signatories = await db.ApprovalSetting.findAll({
                    where: {
                        owner_id: account.user_id,
                        type: 'Leave',
                        is_active: true
                    },
                    order: [['order', 'ASC']]
                });

                for (const sig of signatories) {

                    await db.Approval.create({
                        setting_id: sig.id,
                        document_id: leave.id,
                        status: 'Pending',
                        signed_at: null,
                        remarks: null,
                        is_active: true
                    });

                    /**
                     * Notification to approver
                     */
                    await db.Notification.create({
                        sender_id: req.user?.id,
                        receiver_id: sig.approver_id,
                        content: `New leave application requires your approval.`,
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

                // send email
                const lt = await db.LeaveType.findByPk(typeid)
                const employee = await db.Employee.findByPk(employeeid);
                const mail = employee?.email;
                const control_no = leave?.control_no;
                const firstname = employee?.first_name;
                const leavetype = lt?.name;
                const from = moment(leave?.date_from).format('MMMM DD YYYY');
                const to = moment(leave?.date_to).format('MMMM DD YYYY');
                const lreason = leave?.reason;
                try {
                    const templatePath = path.join(__dirname, '../templates/LeaveApplication.html');
                    let htmlContent = fs.readFileSync(templatePath, 'utf8');
                    htmlContent = htmlContent
                    .replace(/{{\s*control_no\s*}}/g, control_no || 'Control No')
                    .replace(/{{\s*firstname\s*}}/g, firstname || 'Applicant')
                    .replace(/{{\s*leavetype\s*}}/g, leavetype || 'Leave')
                    .replace(/{{\s*from\s*}}/g, from || 'Date From')
                    .replace(/{{\s*to\s*}}/g, to || 'Date To')
                    .replace(/{{\s*lreason\s*}}/g, lreason || 'Reason')

                    await transporter.sendMail({
                        from: `"Centurion Management Collection Inc." <${process.env.MAIL_USER}>`,
                        to: mail,
                        subject: 'Leave Application',
                        html: htmlContent,
                    });
                } catch (emailError) {
                    console.error('Email sending failed:', emailError.message);
                }
        
                res.status(201).json({
                    message: "Record Saved!"
                });
        
            } catch (error) {

                res.status(400).json({ 
                    error: error.message 
                });
        
            }
        },
        ApproveLeaveApplication: async (req, res) => {
            const { 
                id
            } = req.params;
            const { approvalid } = req.body;
        
            try {
        
                // 1️⃣ Fetch the leave application
                const leave = await db.EmployeeLeaveApplication.findByPk(id, {
                    include: [{ model: db.LeaveType, as: 'leaveType' }]
                });
        
                if (!leave) {
                    return res.status(404).json({
                        errors: [{
                            type: "field",
                            value: id,
                            msg: "Record not found!",
                            path: "id",
                            location: "body",
                        }],
                    });
                }
        
                // 2️⃣ Update the specific approval record
                const approval = await db.Approval.findByPk(approvalid);
                if (!approval) {
                    return res.status(404).json({ error: "Approval record not found!" });
                }
        
                await approval.update({ status: 'Approved', signed_at: new Date() });
        
                const totalCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'Leave'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true
                    }
                });
        
                const approvedCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'Leave'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true,
                        status: 'Approved'
                    }
                });
        
                if (totalCount === approvedCount) {
                    await leave.update({ status: 'Approved' });
        
                    const holidays = await db.Holiday.findAll({
                        where: {
                            date: { [Op.between]: [leave.date_from, leave.date_to] },
                            isActive: true
                        }
                    });
        
                    const holidayDates = holidays.map(h => moment(h.date).format('YYYY-MM-DD'));
        
                    // 5️⃣ Compute leave days excluding weekends and holidays
                    const start = moment(leave.date_from);
                    const end = moment(leave.date_to);
                    let daysUsed = 0;
        
                    while (start.isSameOrBefore(end)) {
                        const dayOfWeek = start.day(); // 0 = Sunday, 6 = Saturday
                        const formatted = start.format('YYYY-MM-DD');
        
                        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(formatted)) {
                            daysUsed += 1;
                        }
        
                        start.add(1, 'day');
                    }
        
                    // 6️⃣ Update EmployeeLeaveBalance
                    const leaveBalance = await db.EmployeeLeaveBalance.findOne({
                        where: {
                            employee_id: leave.employee_id,
                            leave_type_id: leave.leave_type_id,
                            is_active: true
                        }
                    });
        
                    if (!leaveBalance) {
                        return res.status(400).json({ error: "Leave balance not found for employee!" });
                    }
        
                    const newUsed = parseFloat(leaveBalance.used) + daysUsed;
                    const newBalance = parseFloat(leaveBalance.earned) - newUsed;
        
                    await leaveBalance.update({
                        used: newUsed,
                        balance: newBalance
                    });

                    /**
                     * Send Notification
                     */
                    const employeeid = leave.employee_id;
                    const accounts = await db.EmployeeAccount.findOne({
                        where: {
                            employee_id: employeeid
                        }
                    });
                    await db.Notification.create({
                        sender_id: req.user?.id,
                        receiver_id: accounts?.user_id,
                        content: `Leave application with control number: ${leave.control_no} has been approved.`,
                        status: 'unread'
                    });

                    const [notificationCount, notifications] = await Promise.all([
                        db.Notification.count({
                            where: { receiver_id: accounts?.user_id, status: 'unread' }
                        }),
                        db.Notification.findAll({
                            where: { receiver_id: accounts?.user_id, status: 'unread' },
                            order: [['createdAt', 'DESC']]
                        })
                    ]);
                    io.to(`user:${accounts?.user_id}`).emit('EmitNotifications', {
                        notifications,
                        count: notificationCount,
                    });
                    /**
                     * send email
                     */
                    const lt = await db.LeaveType.findByPk(leave.leave_type_id)
                    const employee = await db.Employee.findByPk(leave.employee_id);
                    const mail = employee?.email;
                    const control_no = leave?.control_no;
                    const firstname = employee?.first_name;
                    const leavetype = lt?.name;
                    const status = leave?.status;
                    const from = moment(leave?.date_from).format('MMMM DD YYYY');
                    const to = moment(leave?.date_to).format('MMMM DD YYYY');
                    const lreason = leave?.reason;
                    try {
                        const templatePath = path.join(__dirname, '../templates/LeaveApplicationUpdate.html');
                        let htmlContent = fs.readFileSync(templatePath, 'utf8');
                        htmlContent = htmlContent
                        .replace(/{{\s*control_no\s*}}/g, control_no || 'Control No')
                        .replace(/{{\s*firstname\s*}}/g, firstname || 'Applicant')
                        .replace(/{{\s*leavetype\s*}}/g, leavetype || 'Leave')
                        .replace(/{{\s*status\s*}}/g, status || 'Status')
                        .replace(/{{\s*from\s*}}/g, from || 'Date From')
                        .replace(/{{\s*to\s*}}/g, to || 'Date To')
                        .replace(/{{\s*lreason\s*}}/g, lreason || 'Reason')

                        await transporter.sendMail({
                            from: `"Centurion Management Collection Inc." <${process.env.MAIL_USER}>`,
                            to: mail,
                            subject: 'Leave Appoval',
                            html: htmlContent,
                        });
                    } catch (emailError) {
                        console.error('Email sending failed:', emailError.message);
                    }
                }
        
                res.status(201).json({
                    message: "Record Updated!"
                });
        
            } catch (error) {
        
                res.status(400).json({ 
                    error: error.message 
                });
        
            }
        },
        OverideLeaveApplication: async (req, res) => {
            const id = parseInt(req.params.id, 10);
            const { signatories } = req.body; // [2, 3]
        
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
                        where: { id: approvalIds }
                    }
                );
        
                // ---- save override history ----
                await db.ApprovalOveride.bulkCreate(
                    approvalIds.map(id => ({
                        approval_id: id,
                        user_id: req.user.id
                    }))
                );
        
                const leave = await db.EmployeeLeaveApplication.findByPk(id);
        
                const totalCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'Leave'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true
                    }
                });
        
                const approvedCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'Leave'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true,
                        status: 'Approved'
                    }
                });
        
                // 4️⃣ If all approvals done, approve vacancy + approve position
                if (totalCount === approvedCount) {
                    await leave.update({ status: 'Approved' });
        
                    const holidays = await db.Holiday.findAll({
                        where: {
                            date: { [Op.between]: [leave.date_from, leave.date_to] },
                            isActive: true
                        }
                    });
        
                    const holidayDates = holidays.map(h => moment(h.date).format('YYYY-MM-DD'));
        
                    // 5️⃣ Compute leave days excluding weekends and holidays
                    const start = moment(leave.date_from);
                    const end = moment(leave.date_to);
                    let daysUsed = 0;
        
                    while (start.isSameOrBefore(end)) {
                        const dayOfWeek = start.day(); // 0 = Sunday, 6 = Saturday
                        const formatted = start.format('YYYY-MM-DD');
        
                        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(formatted)) {
                            daysUsed += 1;
                        }
        
                        start.add(1, 'day');
                    }
        
                    // 6️⃣ Update EmployeeLeaveBalance
                    const leaveBalance = await db.EmployeeLeaveBalance.findOne({
                        where: {
                            employee_id: leave.employee_id,
                            leave_type_id: leave.leave_type_id,
                            is_active: true
                        }
                    });
        
                    if (!leaveBalance) {
                        return res.status(400).json({ error: "Leave balance not found for employee!" });
                    }
        
                    const newUsed = parseFloat(leaveBalance.used) + daysUsed;
                    const newBalance = parseFloat(leaveBalance.earned) - newUsed;
        
                    await leaveBalance.update({
                        used: newUsed,
                        balance: newBalance
                    });

                    /**
                     * Send Notification
                     */
                    const employeeid = leave.employee_id;
                    const accounts = await db.EmployeeAccount.findOne({
                        where: {
                            employee_id: employeeid
                        }
                    });
                    await db.Notification.create({
                        sender_id: req.user?.id,
                        receiver_id: accounts?.user_id,
                        content: `Leave application with control number: ${leave.control_no} has been approved.`,
                        status: 'unread'
                    });
                    const [notificationCount, notifications] = await Promise.all([
                        db.Notification.count({
                            where: { receiver_id: accounts?.user_id, status: 'unread' }
                        }),
                        db.Notification.findAll({
                            where: { receiver_id: accounts?.user_id, status: 'unread' },
                            order: [['createdAt', 'DESC']]
                        })
                    ]);
                    io.to(`user:${accounts?.user_id}`).emit('EmitNotifications', {
                        notifications,
                        count: notificationCount,
                    });
                    /**
                     * send email
                     */
                    const lt = await db.LeaveType.findByPk(leave.leave_type_id)
                    const employee = await db.Employee.findByPk(leave.employee_id);
                    const mail = employee?.email;
                    const control_no = leave?.control_no;
                    const firstname = employee?.first_name;
                    const leavetype = lt?.name;
                    const status = leave?.status;
                    const from = moment(leave?.date_from).format('MMMM DD YYYY');
                    const to = moment(leave?.date_to).format('MMMM DD YYYY');
                    const lreason = leave?.reason;
                    try {
                        const templatePath = path.join(__dirname, '../templates/LeaveApplicationUpdate.html');
                        let htmlContent = fs.readFileSync(templatePath, 'utf8');
                        htmlContent = htmlContent
                        .replace(/{{\s*control_no\s*}}/g, control_no || 'Control No')
                        .replace(/{{\s*firstname\s*}}/g, firstname || 'Applicant')
                        .replace(/{{\s*leavetype\s*}}/g, leavetype || 'Leave')
                        .replace(/{{\s*status\s*}}/g, status || 'Status')
                        .replace(/{{\s*from\s*}}/g, from || 'Date From')
                        .replace(/{{\s*to\s*}}/g, to || 'Date To')
                        .replace(/{{\s*lreason\s*}}/g, lreason || 'Reason')

                        await transporter.sendMail({
                            from: `"Centurion Management Collection Inc." <${process.env.MAIL_USER}>`,
                            to: mail,
                            subject: 'Leave Appoval',
                            html: htmlContent,
                        });
                    } catch (emailError) {
                        console.error('Email sending failed:', emailError.message);
                    }
                       
                }
        
                return res.status(200).json({
                    message: 'Approval overridden successfully'
                });
        
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                message: 'Failed to override approval',
                error: error.message
                });
            }
        },
        CancelLeaveApplication: async (req, res) => {
            const { 
                id 
            } = req.params;
        
            const transaction = await db.sequelize.transaction();
        
            try {
                const leave = await db.EmployeeLeaveApplication.findByPk(id, {
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });
        
                if (!leave) {
                    await transaction.rollback();
                    return res.status(500).json({
                        errors: [
                        {
                            type: "field",
                            value: id,
                            msg: "Record not found!",
                            path: "name",
                            location: "body",
                        },
                        ],
                    });
                }
        
                // If already cancelled, just return OK (idempotent)
                if (leave.status === "Cancelled") {
                    await transaction.commit();
                    return res.status(200).json({ message: "Record already cancelled." });
                }
        
                // Only restore leave balance if it was previously Approved
                if (leave.status === "Approved") {
                    // Compute applied leave days (inclusive)
                    // NOTE: This counts ALL calendar days. If you want to exclude weekends/holidays,
                    // tell me your rules and we’ll adjust.
                    const from = moment(leave.date_from, "YYYY-MM-DD", true);
                    const to = moment(leave.date_to, "YYYY-MM-DD", true);
        
                    if (!from.isValid() || !to.isValid() || to.isBefore(from, "day")) {
                        await transaction.rollback();
                        return res.status(400).json({ error: "Invalid leave date range." });
                    }
        
                    const appliedDays = to.diff(from, "days") + 1; // inclusive
        
                    // Get leave balance row (lock it to avoid race conditions)
                    const bal = await db.EmployeeLeaveBalance.findOne({
                        where: {
                            employee_id: leave.employee_id,
                            leave_type_id: leave.leave_type_id,
                            is_active: true,
                        },
                        transaction,
                        lock: transaction.LOCK.UPDATE,
                    });
        
                    if (!bal) {
                        await transaction.rollback();
                            return res.status(400).json({
                            error: "Leave balance record not found for this employee and leave type.",
                        });
                    }
        
                    const used = parseFloat(bal.used || 0);
                    const balance = parseFloat(bal.balance || 0);
        
                    // Restore: used goes down, balance goes up
                    // Guard: used should not go negative even if data is inconsistent
                    const newUsed = Math.max(0, used - appliedDays);
                    const newBalance = balance + appliedDays;
        
                    await bal.update(
                        {
                            used: newUsed,
                            balance: newBalance,
                        },
                        { transaction }
                    );
                }
        
                // Finally cancel the leave application
                await leave.update(
                    {
                        status: "Cancelled",
                    },
                    { transaction }
                );

                /**
                 * Send Notification
                 */
                const employeeid = leave.employee_id;
                const accounts = await db.EmployeeAccount.findOne({
                    where: {
                        employee_id: employeeid
                    }
                });
                await db.Notification.create({
                    sender_id: req.user?.id,
                    receiver_id: accounts?.user_id,
                    content: `Leave application with control number: ${leave.control_no} has been approved.`,
                    status: 'unread'
                });
                const [notificationCount, notifications] = await Promise.all([
                    db.Notification.count({
                        where: { receiver_id: accounts?.user_id, status: 'unread' }
                    }),
                    db.Notification.findAll({
                        where: { receiver_id: accounts?.user_id, status: 'unread' },
                        order: [['createdAt', 'DESC']]
                    })
                ]);
                io.to(`user:${accounts?.user_id}`).emit('EmitNotifications', {
                    notifications,
                    count: notificationCount,
                });
                /**
                 * send email
                 */
                const lt = await db.LeaveType.findByPk(leave.leave_type_id)
                const employee = await db.Employee.findByPk(leave.employee_id);
                const mail = employee?.email;
                const control_no = leave?.control_no;
                const firstname = employee?.first_name;
                const leavetype = lt?.name;
                const status = leave?.status;
                const from = moment(leave?.date_from).format('MMMM DD YYYY');
                const to = moment(leave?.date_to).format('MMMM DD YYYY');
                const lreason = leave?.reason;
                try {
                    const templatePath = path.join(__dirname, '../templates/LeaveApplicationUpdate.html');
                    let htmlContent = fs.readFileSync(templatePath, 'utf8');
                    htmlContent = htmlContent
                    .replace(/{{\s*control_no\s*}}/g, control_no || 'Control No')
                    .replace(/{{\s*firstname\s*}}/g, firstname || 'Applicant')
                    .replace(/{{\s*leavetype\s*}}/g, leavetype || 'Leave')
                    .replace(/{{\s*status\s*}}/g, status || 'Status')
                    .replace(/{{\s*from\s*}}/g, from || 'Date From')
                    .replace(/{{\s*to\s*}}/g, to || 'Date To')
                    .replace(/{{\s*lreason\s*}}/g, lreason || 'Reason')

                    await transporter.sendMail({
                        from: `"Centurion Management Collection Inc." <${process.env.MAIL_USER}>`,
                        to: mail,
                        subject: 'Leave Appoval',
                        html: htmlContent,
                    });
                } catch (emailError) {
                    console.error('Email sending failed:', emailError.message);
                }
        
                await transaction.commit();
        
                return res.status(200).json({
                    message:
                        leave.status === "Approved"
                        ? "Record Cancelled! Leave balance restored."
                        : "Record Cancelled!",
                });
            } catch (error) {
                await transaction.rollback();
                return res.status(500).json({ error: error.message });
            }
        },
        /**
         * DTR
         */
        CreateAttendance: async (req, res) => {
            const { 
                dateStart, 
                dateEnd 
            } = req.body;

            if (!dateStart || !dateEnd) {
                return res.status(400).json({
                    message: "dateStart and dateEnd are required.",
                });
            }

            const start = moment(dateStart, "YYYY-MM-DD", true);
            const end = moment(dateEnd, "YYYY-MM-DD", true);

            if (!start.isValid() || !end.isValid()) {
                return res.status(400).json({ 
                    message: "Invalid date format. Use YYYY-MM-DD." 
                });
            }
            if (end.isBefore(start)) {
                return res.status(400).json({ 
                    message: "dateEnd must be >= dateStart." 
                });
            }

            const tx = await sequelize.transaction();

            try {
                // Read email template once
                const templatePath = path.join(__dirname, "../templates/TimeLog.html");
                const templateRaw = fs.readFileSync(templatePath, "utf8");

                // Get all active employees with shifts
                const employees = await db.Employee.findAll({
                    where: { 
                        status: "Active" 
                    },
                    include: [
                        {
                            model: db.EmployeeShift,
                            as: "employeeShifts",
                            required: true,
                            where: { 
                                is_active: true 
                            },
                            include: [
                                {
                                    model: db.Shift,
                                    as: "shift",
                                    include: [
                                        { 
                                            model: db.ShiftDay, 
                                            as: "days" 
                                        }
                                    ],
                                },
                            ],
                        },
                    ],
                    transaction: tx,
                });

                if (!employees.length) {
                    await tx.rollback();
                    return res.status(400).json({
                        message: "No active employees with shifts found.",
                    });
                }

                let attendanceHeadersCreated = 0;
                let attendanceDaysCreated = 0;

                const year = new Date().getFullYear().toString();

                // get latest once (outside loop)
                const latest = await db.Attendance.findOne({
                    where: {
                        control_no: { 
                            [Op.like]: `${year}-%` 
                        },
                    },
                    order: [["control_no", "DESC"]],
                    transaction: tx,
                    lock: tx.LOCK.UPDATE,
                });

                let nextSeq = 1;
                if (latest?.control_no) {
                    const lastSeq = parseInt(latest.control_no.split("-")[1], 10);
                    nextSeq = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;
                }

                for (const emp of employees) {
                    // Prevent duplicate Attendance header
                    const existingHeader = await db.Attendance.findOne({
                        where: {
                            employee_id: emp.id,
                            date_from: dateStart,
                            date_to: dateEnd,
                        },
                        transaction: tx,
                    });

                    if (existingHeader) continue;

                    const newNo = `${year}-${String(nextSeq).padStart(3, "0")}`;
                    nextSeq++;

                    // Create Attendance header ALWAYS
                    const header = await db.Attendance.create(
                        {
                            control_no: newNo,
                            employee_id: emp.id,
                            date_from: dateStart,
                            date_to: dateEnd,
                            status: "Pending",
                        },
                        { transaction: tx }
                    );

                    attendanceHeadersCreated++;

                    /**
                     * GET EMPLOYEE LOGS (RAW) then EXTRACT TIME in Node.js
                     */
                    const logs = await db.EmployeeLog.findAll({
                        where: {
                            employee_id: emp.id,
                            captured_at: {
                                [Op.between]: [`${dateStart} 00:00:00`, `${dateEnd} 23:59:59`],
                            },
                        },
                        attributes: ["captured_at"],
                        order: [["captured_at", "ASC"]],
                        raw: true,
                        transaction: tx,
                    });

                    // Group logs per day: time_in = first, time_out = last
                    const grouped = {};
                    for (const log of logs) {
                        const m = moment(log.captured_at);
                        const work_day = m.format("YYYY-MM-DD");
                        const time = m.format("HH:mm:ss");

                        if (!grouped[work_day]) {
                            grouped[work_day] = { time_in: time, time_out: time };
                        } else {
                            grouped[work_day].time_out = time;
                        }
                    }

                    /**
                     * CREATE EmployeeAttendance ONLY IF LOGS EXIST
                     */
                    const rowsToInsert = [];

                    for (const work_day of Object.keys(grouped)) {
                        const { time_in, time_out } = grouped[work_day];

                        const effectiveES = pickEffectiveEmployeeShift(emp.employeeShifts, work_day);
                        if (!effectiveES?.shift) continue;

                        const shift = effectiveES.shift;

                        const allowedDays = new Set((shift.days || []).map((d) => Number(d.day_of_week)));
                        const dow = moment(work_day, "YYYY-MM-DD", true).isoWeekday(); // 1..7
                        if (allowedDays.size && !allowedDays.has(dow)) continue;

                        const actualIn = combineDayTime(work_day, time_in);
                        const actualOut = combineDayTime(work_day, time_out);

                        const shiftStart = combineDayTime(work_day, shift.start_time);
                        let shiftEnd = combineDayTime(work_day, shift.end_time);
                        if (shift.crosses_midnight) shiftEnd = shiftEnd.add(1, "day");

                        const grace = Number(shift.grace_minutes) || 0;

                        const late_minutes = pos(actualIn.diff(shiftStart.clone().add(grace, "minutes"), "minutes"));
                        const undertime_minutes = pos(shiftEnd.diff(actualOut, "minutes"));

                        // ✅ Overtime based on approved OT schedules
                        const otApps = await getApprovedOvertimesForDay({
                            employeeId: emp.id,
                            workDay: work_day,
                            transaction: tx,
                        });

                        let overtime_minutes = 0;
                        for (const app of otApps) {
                            const ot = app.overtime;
                            if (!ot) continue;

                            let otStart = combineDayTime(work_day, ot.time_start);
                            let otEnd = combineDayTime(work_day, ot.time_end);

                            if (otEnd.isBefore(otStart)) otEnd = otEnd.add(1, "day");
                            overtime_minutes += overlapMinutes(actualIn, actualOut, otStart, otEnd);
                        }

                        rowsToInsert.push({
                            attendance_id: header.id,
                            work_day,
                            time_in,
                            time_out,
                            late_minutes,
                            undertime_minutes,
                            overtime_minutes,
                            is_locked: false,
                            locked_at: null,
                        });
                    }

                    if (rowsToInsert.length) {
                        await db.EmployeeAttendance.bulkCreate(rowsToInsert, { transaction: tx });
                        attendanceDaysCreated += rowsToInsert.length;
                    }

                    /**
                     * SAVE SIGNATORIES ALWAYS
                     */

                    // Employee (order 1)
                    const employeeAccount = await db.EmployeeAccount.findOne({
                        where: { employee_id: emp.id },
                        include: [
                        {
                            model: db.User,
                            as: "user",
                            where: { role: "employee" },
                        },
                        ],
                        transaction: tx,
                    });

                    if (employeeAccount) {
                        const employeeSignatories = await db.ApprovalSetting.findAll({
                            where: {
                                owner_id: employeeAccount.user_id,
                                type: "TimeCard",
                                order: 1,
                                is_active: true,
                            },
                            order: [["order", "ASC"]],
                            transaction: tx,
                        });

                        for (const sig of employeeSignatories) {
                            await db.Approval.create({
                                setting_id: sig.id,
                                document_id: header.id,
                                status: "Pending",
                                signed_at: null,
                                remarks: null,
                                is_active: true,
                                },
                            { transaction: tx });
                        }

                        /**
                         * Notification to approver
                         */
                        await db.Notification.create({
                            sender_id: req.user?.id,
                            receiver_id: employeeAccount.user_id,
                            content: `Daily Time Record with Control No.: ${newNo} for ${dateStart} to ${dateEnd} need your approval`,
                            status: "unread",
                        });

                        const [notificationCount, notifications] = await Promise.all([
                            db.Notification.count({
                                where: { receiver_id: employeeAccount.user_id, status: "unread" },
                            }),
                            db.Notification.findAll({
                                where: { receiver_id: employeeAccount.user_id, status: "unread" },
                                order: [["createdAt", "DESC"]],
                            }),
                        ]);

                        io.to(`user:${employeeAccount.user_id}`).emit("EmitNotifications", {
                            notifications,
                            count: notificationCount,
                        });
                    }

                    // Management (order >= 2)
                    const managementAccount = await db.EmployeeAccount.findAll({
                        include: [
                            {
                                model: db.User,
                                as: "user",
                                where: { 
                                    role: "Management" 
                                },
                            },
                        ],
                        transaction: tx,
                    });

                    if (managementAccount) {
                            const managementSignatories = await db.ApprovalSetting.findAll({
                            where: {
                                owner_id: employeeAccount.user_id,
                                type: "TimeCard",
                                order: { [Op.gte]: 2 },
                                is_active: true,
                            },
                            order: [["order", "ASC"]],
                            transaction: tx,
                        });

                        for (const sig of managementSignatories) {
                            await db.Approval.create({
                                setting_id: sig.id,
                                document_id: header.id,
                                status: "Pending",
                                signed_at: null,
                                remarks: null,
                                is_active: true,
                            }, { transaction: tx });
                        }
                    }

                    // SEND EMAIL (inside loop)
                    const mail = emp?.email;
                    if (mail) {
                        const control_no = header.control_no; //no re-query
                        const firstname = emp?.first_name;
                        const from = moment(dateStart).format("MMMM DD YYYY");
                        const to = moment(dateEnd).format("MMMM DD YYYY");

                        try {
                            let htmlContent = templateRaw
                                .replace(/{{\s*control_no\s*}}/g, control_no || "Control No")
                                .replace(/{{\s*firstname\s*}}/g, firstname || "Employee")
                                .replace(/{{\s*from\s*}}/g, from || "Date From")
                                .replace(/{{\s*to\s*}}/g, to || "Date To");

                            await transporter.sendMail({
                                from: `"Centurion Management Collection Inc." <${process.env.MAIL_USER}>`,
                                to: mail,
                                subject: "Daily Time Record",
                                html: htmlContent,
                            });
                        } catch (emailError) {
                            console.error("Email sending failed:", emailError.message);
                        }
                    }
                }

                if (attendanceHeadersCreated === 0) {
                    throw new Error("Nothing created. Either records exist or no employees found.");
                }

                await tx.commit();

                return res.status(201).json({
                    message: "Record Saved!",
                    attendance_headers_created: attendanceHeadersCreated,
                    attendance_days_created: attendanceDaysCreated,
                });
            } catch (error) {
                await tx.rollback();
                console.error(error);
                return res.status(400).json({
                    error: error.message,
                });
            }
        },
        ApproveAttendance: async (req, res) => {
            const { 
                id
            } = req.params;
            const { 
                approvalid 
            } = req.body;
        
            try {
        
                const attendance = await db.Attendance.findByPk(id);
                
                if (!attendance) {
                    return res.status(500).json({
                        errors: [{
                            type: "field",
                            value: id,
                            msg: "Record not found!",
                            path: "id",
                            location: "body",
                        }],
                    });
                }
        
                const approval = await db.Approval.findByPk(approvalid);
        
                await approval.update({
                    status: 'Approved',
                    signed_at: new Date()
                })
                
                const totalCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'TimeCard'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true
                    }
                });
                
                const approvedCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'TimeCard'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true,
                        status: 'Approved'
                    }
                });
                
                if (totalCount === approvedCount) {
                    await attendance.update({ status: 'Approved' });
                }
        
                res.status(201).json({
                    message: "Record Updated!"
                });
        
            } catch (error) {
        
                res.status(400).json({ 
                    error: error.message 
                });
        
            }
        },
        OverideAttendance: async (req, res) => {
            const id = parseInt(req.params.id, 10);
            const { 
                signatories 
            } = req.body;

            const transaction = await sequelize.transaction();

            try {
                const attendance = await db.Attendance.findByPk(id, { transaction });

                if (!attendance) {
                    await transaction.rollback();
                    return res.status(404).json({
                        errors: [
                            {
                                type: "field",
                                value: id,
                                msg: "Record not found!",
                                path: "id",
                                location: "params",
                            },
                        ],
                    });
                }

                // ---- validate payload ----
                if (!Array.isArray(signatories) || signatories.length === 0) {
                    await transaction.rollback();
                    return res.status(400).json({ message: "No signatories provided" });
                }

                const approvalIds = [
                    ...new Set(
                        signatories
                        .map((v) => Number(v))
                        .filter((v) => Number.isInteger(v) && v > 0)
                    ),
                ];

                if (approvalIds.length === 0) {
                    await transaction.rollback();
                    return res.status(400).json({ message: "Invalid signatories payload" });
                }

                // ---- fetch approvals (must be active) ----
                const approvals = await db.Approval.findAll({
                    where: {
                        id: approvalIds,
                        is_active: true,
                    },
                    transaction,
                });

                if (approvals.length === 0) {
                    await transaction.rollback();
                    return res.status(404).json({ message: "No approvals found to override" });
                }

                // ensure approvals belong to this document
                const invalid = approvals.some((a) => Number(a.document_id) !== Number(id));
                if (invalid) {
                    await transaction.rollback();
                    return res
                        .status(400)
                        .json({ message: "Some approvals do not belong to this document." });
                }

                // ---- update approvals as overridden/approved ----
                await db.Approval.update({
                    status: "Approved",
                    is_overide: true,
                    signed_at: new Date(),
                }, {
                    where: { 
                        id: approvalIds 
                    }, transaction});

                // ---- save override history ----
                await db.ApprovalOveride.bulkCreate(
                    approvalIds.map((approval_id) => ({
                        approval_id,
                        user_id: req.user.id,
                    })),
                    { transaction }
                );

                // ---- if all required approvals are approved, approve attendance ----
                const totalCount = await db.Approval.count({
                    include: [
                        {
                        model: db.ApprovalSetting,
                        as: "setting",
                        where: { type: "TimeCard" },
                        },
                    ],
                    where: {
                        document_id: id,
                        is_active: true,
                    },
                    transaction,
                });

                const approvedCount = await db.Approval.count({
                    include: [
                        {
                        model: db.ApprovalSetting,
                        as: "setting",
                        where: { type: "TimeCard" },
                        },
                    ],
                    where: {
                        document_id: id,
                        is_active: true,
                        status: "Approved",
                    },
                    transaction,
                });

                if (totalCount > 0 && totalCount === approvedCount) {
                    await attendance.update({ status: "Approved" }, { transaction });
                }

                await transaction.commit();

                return res.status(200).json({
                    message: "Approval overridden successfully",
                    totalCount,
                    approvedCount,
                    attendanceStatus:
                        totalCount > 0 && totalCount === approvedCount
                        ? "Approved"
                        : attendance.status,
                });
            } catch (error) {
                await transaction.rollback();
                console.error(error);
                return res.status(500).json({
                    message: "Failed to override approval",
                    error: error.message,
                });
            }
            },
    };
};
