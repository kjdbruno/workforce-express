const { Op } = require("sequelize");
const db = require('../models');
const { sequelize } = db;

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');

const pug = require('pug');
const puppeteer = require('puppeteer');

exports.GetAll = async (req, res) => {
    const Page = parseInt(req.query.Page, 10) || 1;
    const Limit = parseInt(req.query.Limit, 10) || 10;
    const Filter = (req.query.Filter || '').trim();
    const Offset = (Page - 1) * Limit;

    const month = Number(req.query.month);
    const year = Number(req.query.year);

    try {
        const startDate = moment(`${year}-${month}-01`, "YYYY-MM-DD").startOf("month").format("YYYY-MM-DD");
        const endDate   = moment(`${year}-${month}-01`, "YYYY-MM-DD").endOf("month").format("YYYY-MM-DD");

        const where = {
            [Op.and]: [
                { date_from: { [Op.lte]: endDate } },
                { date_to: { [Op.gte]: startDate } },
            ],
            ...(Filter
                ? {
                    [Op.or]: [
                    { '$employee.first_name$':  { [Op.like]: `%${Filter}%` } },
                    { '$employee.middle_name$': { [Op.like]: `%${Filter}%` } },
                    { '$employee.last_name$':   { [Op.like]: `%${Filter}%` } },
                    { '$leaveType.name$':       { [Op.like]: `%${Filter}%` } },
                    ],
                }
                : {}),
        };

        const { count, rows } = await db.EmployeeLeaveApplication.findAndCountAll({
            include: [
                { model: db.Employee, as: 'employee', required: false },
                { model: db.LeaveType, as: 'leaveType', required: false },
            ],
            where,
            subQuery: false,
            distinct: true,
            limit: Limit,
            offset: Offset,
            order: [['createdAt', 'DESC']],
        });

        return res.json({
            data: rows,
            meta: {
                TotalItems: count,
                TotalPages: Math.ceil(count / Limit),
                CurrentPage: Page,
            },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


exports.GetDetails = async (req, res) => {

    const { id } = req.params;

    try {
        
        const leave = await db.EmployeeLeaveApplication.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: db.Employee,
                    as: 'employee',
                },
                {
                    model: db.LeaveType,
                    as: 'leaveType'
                }
            ]
        });

        const approvals = await db.Approval.findAll({
            where: { document_id: leave.id, is_active: true },
            include: [
                {
                    model: db.ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Leave'
                    },
                    include: [
                        {
                            model: db.User,
                            as: 'approver',
                            attributes: ['id'],
                            include: [
                                {
                                    model: db.EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: db.Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: db.Employment,
                                                    as: 'employment',
                                                    include: [{ 
                                                        model: db.Position, 
                                                        as: 'position' 
                                                    }]
                                                },
                                                {
                                                    model: db.EmployeeSignature,
                                                    as: 'signature'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: db.User,
                            as: 'owner',
                            attributes: ['id'],
                            include: [
                                {
                                    model: db.EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: db.Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: db.Employment,
                                                    as: 'employment',
                                                    include: [{ 
                                                        model: db.Position, 
                                                        as: 'position' 
                                                    }]
                                                },
                                                {
                                                    model: db.EmployeeSignature,
                                                    as: 'signature'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [[{ model: db.ApprovalSetting, as: 'setting' }, 'order', 'ASC']]
        });

        // 3️⃣ Combine vacancy + approvals
        const result = {
            ...leave.toJSON(),
            approvals
        };

        res.json({ result });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GetEmployee = async (req, res) => {
    try {
        const data = await db.Employee.findAll();
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

exports.GetLeaveType = async (req, res) => {
    try {
        const data = await db.LeaveType.findAll({
            where: {
                is_active: true
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

exports.Create = async (req, res) => {

    const { 
        employeeid,
        typeid,
        datestart,
        dateend,
        reason
    } = req.body;

    try {
        // get employee userid
        const account = await db.EmployeeAccount.findOne({
            employee_id: employeeid
        });

        // save leave
        const leave = await db.EmployeeLeaveApplication.create({
            employee_id: employeeid,
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

            const isFirstApprover = sig.order === 1;

            await db.Approval.create({
                setting_id: sig.id,
                document_id: leave.id,
                status: isFirstApprover ? 'Approved' : 'Pending',
                signed_at: isFirstApprover ? new Date() : null,
                remarks: isFirstApprover ? 'Auto-approved (owner is first approver)' : null,
                is_active: true
            });
        }

        res.status(201).json({
            message: "Record Saved!"
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Approve = async (req, res) => {

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

        // 3️⃣ Refresh leave status based on approvals
        const pendingApprovals = await db.Approval.count({
            where: {
                document_id: id,
                status: { [Op.ne]: "Approved" }
            }
        });

        // If all approvals done OR leave is already approved
        if (pendingApprovals === 0 || leave.status === 'Approved') {
            if (leave.status !== 'Approved') {
                await leave.update({ status: 'Approved' });
            }

            // 4️⃣ Fetch holidays within leave period
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
        }

        res.status(201).json({
            message: "Record Updated!"
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Cancel = async (req, res) => {
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
};


exports.GenerateLeavePDF = async (req, res) => {

    const { id } = req.params;
    let browser;

    try {
        // 1️⃣ Get leave application
        const leaveApp = await db.EmployeeLeaveApplication.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: db.Employee,
                    as: 'employee',
                    include: [
                        {
                            model: db.Employment,
                            as: 'employment',
                            include: [
                                { 
                                    model: db.Department, 
                                    as: 'department', 
                                    attributes: ['name'] 
                                },
                                { 
                                    model: db.Position, 
                                    as: 'position' 
                                }
                            ]
                        }
                    ]
                },
                {
                    model: db.LeaveType,
                    as: 'leaveType',
                    attributes: ['id', 'name', 'credit']
                }
            ]
        });

        if (!leaveApp) {
            return res.status(404).json({ message: 'Leave application not found' });
        }

        const employee = leaveApp.employee;
        const employment = employee.employment;

        // 2️⃣ Format employee info
        const name = [
            employee.first_name,
            employee.middle_name ? `${employee.middle_name.charAt(0)}.` : '',
            employee.last_name,
            employee.suffix || ''
        ].join(' ').replace(/\s+/g, ' ').trim();
        
        const departmentPosition = `${employment?.department?.name || ''} - ${employment?.position?.name || ''}`;
        const contactNo = employee.contact_number || '';

        const dateFiled = moment(leaveApp.createdAt).format('MMMM DD, YYYY');
        const reason = leaveApp.reason;
        const status = leaveApp.status;

        // 3️⃣ Leave date range
        const leaveStart = moment(leaveApp.date_from).format('MMMM DD, YYYY');
        const leaveEnd = moment(leaveApp.date_to).format('MMMM DD, YYYY');
        const totalDays = moment(leaveApp.date_to).diff(moment(leaveApp.date_from), 'days') + 1;

        // 4️⃣ All leave types (checkbox-style display)
        const leaveTypes = await db.LeaveType.findAll({
            attributes: ['id', 'name']
        });

        const formattedLeaveTypes = leaveTypes.map(lt => ({
            ...lt.toJSON(),
            active: lt.id === leaveApp.leave_type_id
        }));

        // 5️⃣ Leave balances of employee
        const leaveBalances = await db.EmployeeLeaveBalance.findAll({
            where: {
                employee_id: employee.id,
                is_active: true
            },
            include: [
                {
                    model: db.LeaveType,
                    as: 'leaveType',
                    attributes: ['name']
                }
            ]
        });

        const balance = leaveBalances.map(lb => ({
            leaveType: lb.leaveType?.name,
            earned: Number(lb.earned),
            used: Number(lb.used),
            balance: Number(lb.balance)
        }));

        // approvals
        const approvals = await db.Approval.findAll({
            where: { document_id: leaveApp.id, is_active: true },
            include: [
                {
                    model: db.ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Leave'
                    },
                    include: [
                        {
                            model: db.User,
                            as: 'approver',
                            attributes: ['id'],
                            include: [
                                {
                                    model: db.EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: db.Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: db.Employment,
                                                    as: 'employment',
                                                    include: [
                                                        { 
                                                            model: db.Position, 
                                                            as: 'position' 
                                                        }
                                                    ]
                                                },
                                                {
                                                    model: db.EmployeeSignature,
                                                    as: 'signature'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: db.User,
                            as: 'owner',
                            attributes: ['id'],
                            include: [
                                {
                                    model: db.EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: db.Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: db.Employment,
                                                    as: 'employment',
                                                    include: [
                                                        { 
                                                            model: db.Position, 
                                                            as: 'position' 
                                                        }
                                                    ]
                                                },
                                                {
                                                    model: db.EmployeeSignature,
                                                    as: 'signature'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [[{ model: db.ApprovalSetting, as: 'setting' }, 'order', 'ASC']]
        });

        // Map approvals to the desired format
        const signatories = approvals.map((app) => {
            const employee = app?.setting?.approver?.employeeAccount?.employee;
            const profile = employee || {};

            const position = employee?.employment?.position?.name;
            // Format full name (First M. Last Suffix)
            const first = profile?.first_name || '';
            const middle = profile?.middle_name ? `${profile.middle_name.charAt(0)}.` : '';
            const last = profile?.last_name || '';
            const suffix = profile?.suffix ? ` ${profile.suffix}` : '';
            const userName = `${first} ${middle} ${last}${suffix}`.replace(/\s+/g, ' ').trim();

            // Only show signature & date if approval is approved
            const isApproved = app?.status === 'Approved';
            const signaturePath = employee?.signature?.signature; // Assuming approval setting stores the signature path

            return {
                description: app?.setting.description || '',
                approver: userName,
                position,
                signature: isApproved && signaturePath
                    ? 'data:image/png;base64,' +
                    fs.readFileSync(path.join(__dirname, `../public/${signaturePath}`)).toString('base64')
                    : null,
                date: isApproved ? moment(app?.signed_at || app?.createdAt).format('MMMM DD, YYYY hh:mm A') : null,
                isSigned: isApproved
            };
        });

        // 6️⃣ Render PDF
        const templatePath = path.join(__dirname, '../templates/reports/Leave.pug');
        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const html = pug.renderFile(templatePath, {
            seal,
            name,
            departmentPosition,
            contactNo,
            dateFiled,
            leaves: formattedLeaveTypes,
            reason,
            status,
            leaveStart,
            leaveEnd,
            totalDays,
            balance,
            signatories
        });

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('print');

        const pdfBuffer = await page.pdf({
            width: '8.5in',
            height: '11in',
            margin: {
                top: '25px',
                bottom: '25px',
                left: '25px',
                right: '25px'
            },
            printBackground: true
        });
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
};


