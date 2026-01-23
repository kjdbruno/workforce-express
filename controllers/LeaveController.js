const { Op } = require("sequelize");
const { EmployeeLeaveApplication, Employee, LeaveType, EmployeeAccount, Approval, ApprovalSetting, User, Employment, Position, Company, Department, EmployeeLeaveBalance, Holiday } = require('../models');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');

const pug = require('pug');
const puppeteer = require('puppeteer');

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;
    const { month, year } = req.query;

    try {

        const months = parseInt(month); // e.g., 11 for November
        const years = parseInt(year);   // e.g., 2025

        // Build month start and end
        const startDateMoment = moment(`${years}-${months}-01`, "YYYY-MM-DD").startOf("month");
        const endDateMoment = moment(`${years}-${months}-01`, "YYYY-MM-DD").endOf("month");

        // Format for DB query
        const startDate = startDateMoment.format("YYYY-MM-DD");
        const endDate = endDateMoment.format("YYYY-MM-DD");

        const { count, rows } = await EmployeeLeaveApplication.findAndCountAll({
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    where: Filter
                        ? {
                            [Op.or]: [
                                { first_name: { [Op.like]: `%${Filter}%` } },
                                { middle_name: { [Op.like]: `%${Filter}%` } },
                                { last_name: { [Op.like]: `%${Filter}%` } },
                            ]
                        }
                    : undefined
                },
                {
                    model: LeaveType,
                    as: 'leaveType',
                    where: Filter
                        ? {
                            name: { [Op.like]: `%${Filter}%` }
                        }
                    : undefined
                }
            ],
            where: {
                [Op.and]: [
                    { date_from: { [Op.lte]: endDate } }, // leave starts before or on endOfMonth
                    { date_to: { [Op.gte]: startDate } }  // leave ends after or on startOfMonth
                ]
            },
            limit: Limit,
            offset: Offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            data: rows,
            meta: {
                TotalItems: count,
                TotalPages: Math.ceil(count / Limit),
                CurrentPage: Page
            }
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GetDetails = async (req, res) => {

    const { id } = req.params;

    try {
        
        const leave = await EmployeeLeaveApplication.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                },
                {
                    model: LeaveType,
                    as: 'leaveType'
                }
            ]
        });

        const approvals = await Approval.findAll({
            where: { document_id: leave.id, is_active: true },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Leave'
                    },
                    include: [
                        {
                            model: User,
                            as: 'approver',
                            attributes: ['id'],
                            include: [
                                {
                                    model: EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: Employment,
                                                    as: 'employment',
                                                    include: [{ model: Position, as: 'position' }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: User,
                            as: 'owner',
                            attributes: ['id'],
                            include: [
                                {
                                    model: EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: Employment,
                                                    as: 'employment',
                                                    include: [{ model: Position, as: 'position' }]
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
            order: [[{ model: ApprovalSetting, as: 'setting' }, 'order', 'ASC']]
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

const Get = async (id) => {
    return await Leave.findOne({
        where: { 
            id 
        },
        include: [
            {
                model: ProfileLeave,
                as: 'profileLeave',
                attributes: [
                    'credit', 'profileId'
                ],
                include: [
                    {
                        model: Profile,
                        as: 'profile',
                        attributes: [
                            'firstname', 'middlename', 'lastname', 'suffix'
                        ]
                    },
                    {
                        model: LeaveType,
                        as: 'leaveType',
                        attributes: [
                            'name'
                        ]
                    }
                ]
            },
            {
                model: LeaveRequest,
                as: 'requests',
                include: [
                    {
                        model: Signatory,
                        as: 'signatory',
                        include: [
                            {
                                model: User,
                                as: 'user',
                                include: [
                                    {
                                        model: Profile,
                                        as: 'profile'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        order: [
            [
                { model: LeaveRequest, as: 'requests' },
                { model: Signatory, as: 'signatory' },
                    'order',
                    'ASC'
            ],
        ]
    });
};

exports.GetAllUsers = async (req, res) => {

    try {
        
        const rows = await Profile.findAll({
            where: {
                isEmployee: true
            },
            attributes: [
                'id', 'firstname', 'middlename', 'lastname', 'suffix'
            ],
            include: [
                {
                    model: EmploymentInformation,
                    as: 'employment',
                    attributes: [
                        'employeeNo'
                    ]
                }
            ],
        });
        return res.status(200).json(rows);
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GetEmployee = async (req, res) => {
    try {
        const data = await Employee.findAll();
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

exports.GetLeaveType = async (req, res) => {
    try {
        const data = await LeaveType.findAll({
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
        const account = await EmployeeAccount.findOne({
            employee_id: employeeid
        });

        // save leave
        const leave = await EmployeeLeaveApplication.create({
            employee_id: employeeid,
            leave_type_id: typeid,
            date_from: datestart,
            date_to: dateend,
            reason,
            status: 'Filed'
        });

        // Fetch approval settings by document type
        const signatories = await ApprovalSetting.findAll({
            where: {
                owner_id: account.user_id,
                type: 'Leave',
                is_active: true
            },
            order: [['order', 'ASC']]
        });

        for (const sig of signatories) {

            const isFirstApprover = sig.order === 1;

            await Approval.create({
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
        const leave = await EmployeeLeaveApplication.findByPk(id, {
            include: [{ model: LeaveType, as: 'leaveType' }]
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
        const approval = await Approval.findByPk(approvalid);
        if (!approval) {
            return res.status(404).json({ error: "Approval record not found!" });
        }

        await approval.update({ status: 'Approved' });

        // 3️⃣ Refresh leave status based on approvals
        const pendingApprovals = await Approval.count({
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
            const holidays = await Holiday.findAll({
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
            const leaveBalance = await EmployeeLeaveBalance.findOne({
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
  
    try {

        const leave = await EmployeeLeaveApplication.findByPk(id);

        if (!leave) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        await leave.update({ 
            status: 'Cancelled'
        });

        res.status(200).json({
            message: "Record Cancelled!"
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GenerateLeavePDF = async (req, res) => {

    const { id } = req.params;
    let browser;

    try {
        // 1️⃣ Get leave application
        const leaveApp = await EmployeeLeaveApplication.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [
                        {
                            model: Employment,
                            as: 'employment',
                            include: [
                                { 
                                    model: Company, 
                                    as: 'company', 
                                    attributes: ['name'] 
                                },
                                { 
                                    model: Department, 
                                    as: 'department', 
                                    attributes: ['name'] 
                                },
                                { 
                                    model: Position, 
                                    as: 'position' 
                                }
                            ]
                        }
                    ]
                },
                {
                    model: LeaveType,
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

        const company = employment?.company?.name || '';
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
        const leaveTypes = await LeaveType.findAll({
            attributes: ['id', 'name']
        });

        const formattedLeaveTypes = leaveTypes.map(lt => ({
            ...lt.toJSON(),
            active: lt.id === leaveApp.leave_type_id
        }));

        // 5️⃣ Leave balances of employee
        const leaveBalances = await EmployeeLeaveBalance.findAll({
            where: {
                employee_id: employee.id,
                is_active: true
            },
            include: [
                {
                    model: LeaveType,
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
        const approvals = await Approval.findAll({
            where: { document_id: leaveApp.id, is_active: true },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Leave'
                    },
                    include: [
                        {
                            model: User,
                            as: 'approver',
                            attributes: ['id'],
                            include: [
                                {
                                    model: EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: Employment,
                                                    as: 'employment',
                                                    include: [{ model: Position, as: 'position' }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: User,
                            as: 'owner',
                            attributes: ['id'],
                            include: [
                                {
                                    model: EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: Employment,
                                                    as: 'employment',
                                                    include: [{ model: Position, as: 'position' }]
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
            order: [[{ model: ApprovalSetting, as: 'setting' }, 'order', 'ASC']]
        });

        const result = {
            ...leaveApp.toJSON(),
            approvals
        };

        // Map approvals to the desired format
        const signatories = approvals.map((app) => {
            const employee = app?.setting?.approver?.employeeAccount?.employee;
            const profile = employee || {};

            const position = app?.setting?.approver?.employeeAccount?.employment?.position?.name || '';
            // Format full name (First M. Last Suffix)
            const first = profile?.first_name || '';
            const middle = profile?.middle_name ? `${profile.middle_name.charAt(0)}.` : '';
            const last = profile?.last_name || '';
            const suffix = profile?.suffix ? ` ${profile.suffix}` : '';
            const userName = `${first} ${middle} ${last}${suffix}`.replace(/\s+/g, ' ').trim();

            // Only show signature & date if approval is approved
            const isApproved = app?.status === 'Approved';
            const signaturePath = app?.setting?.signature; // Assuming approval setting stores the signature path

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
            company,
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


