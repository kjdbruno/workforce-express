const { Op } = require("sequelize");
const { Overtime, EmployeeOvertimeApplication, ApprovalSetting, Approval, Employee, User, EmployeeAccount, Employment, Position } = require('../models');

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

        // const where = {};

        // if (Filter) {
        //     where.description = { [Op.like]: `%${Filter}%` };
        // }

        const { count, rows } = await Overtime.findAndCountAll({
            include: [
                {
                    model: EmployeeOvertimeApplication,
                    as: 'applications'
                }
            ],
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
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

exports.Create = async (req, res) => {

    const {
        date,
        timeStart,
        timeEnd,
        description,
        employees
    } = req.body;

    try {
        const empList = Array.isArray(employees) ? employees : [];

        // Create overtime header
        const overtime = await Overtime.create({
            date,
            time_start: timeStart,
            time_end: timeEnd,
            description
        });

        // Get existing applications for this overtime (if editing, pass overtime_id)
        const existingRecords = await EmployeeOvertimeApplication.findAll({
            where: {
                overtime_id: overtime.id
            }
        });

        const existingIds = existingRecords.map(e => e.id);
        const sentIds = empList.filter(e => e.id).map(e => e.id);

        for (const emp of empList) {
            if (emp.id && existingIds.includes(emp.id)) {
                // UPDATE existing
                await EmployeeOvertimeApplication.update({
                    employee_id: emp.employeeid
                }, {
                    where: { 
                        id: emp.id 
                    }
                });
            } else {
                // INSERT new
                await EmployeeOvertimeApplication.create({
                    overtime_id: overtime.id,
                    employee_id: emp.employeeid
                });
            }
        }

        // Deactivate removed employees
        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await EmployeeOvertimeApplication.update({
                    status: 'Cancelled' 
                },
                { where: {
                    id: toDeactivate 
                }
            });
        }

        // Fetch approval settings by document type
        const signatories = await ApprovalSetting.findAll({
            where: {
                owner_id: req.user.id,
                type: 'Overtime',
                is_active: true
            },
            order: [['order', 'ASC']]
        });

        for (const sig of signatories) {

            const isFirstApprover = sig.order === 1;

            await Approval.create({
                setting_id: sig.id,
                document_id: overtime.id,
                status: isFirstApprover ? 'Approved' : 'Pending',
                signed_at: isFirstApprover ? new Date() : null,
                remarks: isFirstApprover ? 'Auto-approved (owner is first approver)' : null,
                is_active: true
            });
        }

        res.status(201).json({
            message: 'Record Saved!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to save overtime record', error });
    }

};

exports.Update = async (req, res) => {
    const { id } = req.params;

    const {
        date,
        timeStart,
        timeEnd,
        description,
        employees
    } = req.body;

    try {
        const empList = Array.isArray(employees) ? employees : [];

        // Update overtime header
        await Overtime.update({
            date,
            time_start: timeStart,
            time_end: timeEnd,
            description
        }, {
            where: { id }
        });

        // Get existing applications for this overtime
        const existingRecords = await EmployeeOvertimeApplication.findAll({
            where: {
                overtime_id: id
            }
        });

        const existingIds = existingRecords.map(e => e.id);
        const sentIds = empList.filter(e => e.id).map(e => e.id);

        for (const emp of empList) {
            if (emp.id && existingIds.includes(emp.id)) {
                // UPDATE existing
                await EmployeeOvertimeApplication.update({
                    employee_id: emp.employeeid,
                    status: emp.status
                }, {
                    where: { id: emp.id }
                });
            } else {
                // INSERT new
                await EmployeeOvertimeApplication.create({
                    overtime_id: id,
                    employee_id: emp.employeeid,
                    status: 'Pending'
                });
            }
        }

        // Deactivate removed employees
        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await EmployeeOvertimeApplication.update({
                status: 'Cancelled'
            }, {
                where: {
                    id: toDeactivate
                }
            });
        }

        res.status(200).json({
            message: 'Record Updated!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to update overtime record',
            error
        });
    }
};


exports.GetDetails = async (req, res) => {

    const { id } = req.params;

    try {
        
        const overtime = await Overtime.findOne({
            include: [
                {
                    model: EmployeeOvertimeApplication,
                    as: 'applications',
                    where: {
                        status: {
                            [Op.ne]: 'Cancelled'
                        }
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
                                            model: Position,
                                            as: 'position'
                                        }
                                    ]
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

        const approvals = await Approval.findAll({
            where: { document_id: overtime.id, is_active: true },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Overtime'
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
            ...overtime.toJSON(),
            approvals
        };

        res.json({ result });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.Cancel = async (req, res) => {

    const { 
        id 
    } = req.params;
  
    try {

        const ot = await Overtime.findByPk(id);

        if (!ot) {
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

        await ot.update({ 
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

exports.GenerateOvertimePDF = async (req, res) => {

    const { id } = req.params;
    let browser;

    try {
        
        const overtime = await Overtime.findOne({
            where: { id },
            attributes: [
                'id',
                'date',
                'time_start',
                'time_end',
                'status',
                'description',
                'createdAt'
            ],
            include: [
                {
                    model: EmployeeOvertimeApplication,
                    as: 'applications',
                    where: {
                        status: {
                            [Op.ne]: 'Cancelled'
                        }
                    },
                    required: false,
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                            attributes: ['first_name', 'middle_name', 'last_name'],
                            include: [
                                {
                                    model: Employment,
                                    as: 'employment',
                                    attributes: ['id'],
                                    include: [
                                        {
                                            model: Position,
                                            as: 'position',
                                            attributes: ['name', 'hourly_salary']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // Helper: compute hours between start and end
        const computeHours = (start, end) => {
            const startTime = new Date(`1970-01-01T${start}`);
            const endTime = new Date(`1970-01-01T${end}`);
            const diff = (endTime - startTime) / (1000 * 60 * 60);
            return diff > 0 ? diff : 0;
        };

        const hours = computeHours(overtime.time_start, overtime.time_end);

        const pesoFormatter = new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        });

        // Build employees list
        const employees = overtime.applications.map(app => {
            const emp = app.employee;

            const fullName = [
                emp.first_name,
                emp.middle_name,
                emp.last_name,
                emp.suffix
            ].filter(Boolean).join(' ');


            const position = emp.employment?.position?.name || 'N/A';
            const hourlyRate = emp.employment?.position?.hourly_salary || 0;
            const estimatedRate = hourlyRate * hours;

            return {
                name: fullName,
                position,
                hourly_rate: pesoFormatter.format(hourlyRate),
                hours,
                estimated_rate: pesoFormatter.format(estimatedRate)
            };
        });

        // approvals
        const approvals = await Approval.findAll({
            where: { document_id: overtime.id, is_active: true },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Overtime'
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
        const templatePath = path.join(__dirname, '../templates/reports/Overtime.pug');
        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const html = pug.renderFile(templatePath, {
            seal,
            dateFiled: overtime.createdAt,               // 1
            date: overtime.date,                          // 2
            time: `${overtime.time_start} - ${overtime.time_end}`, // 3
            status: overtime.status,                               // 4
            description: overtime.description,                     // 5
            employees,
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
