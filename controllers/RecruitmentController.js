const { Op, Sequelize  } = require("sequelize");
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment');
const db = require('../models');
const { sequelize } = db;

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {

        const { count, rows } = await db.Vacancy.findAndCountAll({
            include: [
                {
                    model: db.Position,
                    as: 'position',
                    attributes: [
                        'name', 'salary_type',
                        [
                            sequelize.literal(`
                            CASE position.salary_type
                                WHEN 'Monthly' THEN position.monthly_salary
                                WHEN 'Daily' THEN position.daily_salary
                                WHEN 'Hourly' THEN position.hourly_salary
                                ELSE NULL
                            END
                            `),
                            'salary_amount'
                        ]
                    ]
                }
            ],
            where: Filter
                ? { '$position.name$': { [Op.like]: `%${Filter}%` } }
                : undefined,
            subQuery: false,
            limit: Limit,
            offset: Offset,
            order: [
                ['createdAt', 'DESC']
            ]
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

exports.GetPosition = async (req, res) => {

    try {
        const data = await db.Position.findAll({
            where: {
                is_active: true,
                status: 'Vacant'
            },
            attributes: [
                'id',
                ['id', 'value'],
                ['name', 'label'],
                'description',
                'qualification',
                'salary_type',
                'status',
                // Dynamic salary range based on salary_type
                [
                    Sequelize.literal(`
                        CASE salary_type
                            WHEN 'Monthly' THEN CONCAT(
                                FORMAT(monthly_salary * 0.9, 2),
                                ' - ',
                                FORMAT(monthly_salary * 1.1, 2)
                            )
                            WHEN 'Daily' THEN CONCAT(
                                FORMAT(daily_salary * 0.9, 2),
                                ' - ',
                                FORMAT(daily_salary * 1.1, 2)
                            )
                            WHEN 'Hourly' THEN CONCAT(
                                FORMAT(hourly_salary * 0.9, 2),
                                ' - ',
                                FORMAT(hourly_salary * 1.1, 2)
                            )
                            ELSE NULL
                        END
                    `),
                    'amount'
                ]
            ],
            order: [['id', 'ASC']]
        });

        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });

    }
};

exports.GetDepartment = async (req, res) => {

    try {
        const data = await db.Department.findAll({
            where: {
                is_active: true
            },
            attributes: [
                ['id', 'value'],
                ['name', "label"]
            ],
            order: [['id', 'ASC']]
        });
        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GetShift = async (req, res) => {
    try {
        const data = await db.Shift.findAll({
            attributes: [
                ['id', 'value'],
                [
                Sequelize.literal(`
                    CONCAT(
                    code, ' - ',
                    name, ' (',
                        TIME_FORMAT(start_time, '%h:%i %p'),
                        ' - ',
                        TIME_FORMAT(end_time, '%h:%i %p'),
                    ')',
                    ' [',
                        IFNULL(
                        GROUP_CONCAT(
                            CASE days.day_of_week
                            WHEN 1 THEN 'Mon'
                            WHEN 2 THEN 'Tue'
                            WHEN 3 THEN 'Wed'
                            WHEN 4 THEN 'Thu'
                            WHEN 5 THEN 'Fri'
                            WHEN 6 THEN 'Sat'
                            WHEN 7 THEN 'Sun'
                            ELSE days.day_of_week
                            END
                            ORDER BY
                            CASE days.day_of_week
                                WHEN 1 THEN 1
                                WHEN 2 THEN 2
                                WHEN 3 THEN 3
                                WHEN 4 THEN 4
                                WHEN 5 THEN 5
                                WHEN 6 THEN 6
                                WHEN 7 THEN 7
                                ELSE 99
                            END
                            SEPARATOR ', '
                        ),
                        ''
                        ),
                    ']'
                    )
                `),
                'label'
                ],
            ],
            include: [
                {
                    model: db.ShiftDay,
                    as: 'days',
                    attributes: [],
                    required: false,
                },
            ],
            group: ['Shift.id'],
            order: [['id', 'ASC']],
            subQuery: false,
        });

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.GetDetails = async (req, res) => {

    const { id } = req.params;

    try {

        const vacancy = await db.Vacancy.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: db.Position,
                    as: 'position',
                    attributes: [
                        'name', 'salary_type', 'description', 'qualification',
                        [
                            sequelize.literal(`
                            CASE position.salary_type
                                WHEN 'Monthly' THEN position.monthly_salary
                                WHEN 'Daily' THEN position.daily_salary
                                WHEN 'Hourly' THEN position.hourly_salary
                                ELSE NULL
                            END
                            `),
                            'salary_amount'
                        ]
                    ]
                },
                {
                    model: db.Department,
                    as: 'department',
                    attributes: ['name']
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
        });

        const approvals = await db.Approval.findAll({
            where: {
                document_id: vacancy.id,
                is_active: true
            },
            include: [
                {
                    model: db.ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Vacancy'
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
                                                            as: 'position',
                                                        }
                                                    ]
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
                                                            as: 'position',
                                                        }
                                                    ]
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
            order: [
                [
                    { 
                        model: db.ApprovalSetting, 
                        as: 'setting' 
                    }, 
                    'order', 'ASC']
            ]
        });

        // 3️⃣ Combine vacancy + approvals
        const result = {
            ...vacancy.toJSON(),
            approvals
        };

        res.json({ data: result });

    } catch (error) {
        res.status(500).json({ error: error.message });

    }
};

exports.Create = async (req, res) => {

    const { 
        positionId,
        departmentId,
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
            department_id: departmentId,
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
        }

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!"
        });

    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

const GetRecruitment = async (id) => {

    return await db.Vacancy.findOne({
        include: [
                {
                    model: db.Position,
                    as: 'position'
                },
                
            ],
        where: {
            id
        }
    });

};

exports.Approve = async (req, res) => {

    const { 
        vacancyId
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        // 1️⃣ Find the Approval record for this approver
        const approval = await db.Approval.findOne({
            where: {
                document_id: vacancyId,
                is_active: true
            },
            include: [
                {
                    model: db.ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Vacancy',
                        approver_id: req.user.id, // ✅ filter by current approver
                        is_active: true
                    }
                }
            ]
        }, transaction);

        if (!approval) {
            return res.status(404).json({
                message: 'Approval record not found for this document and approver.'
            });
        }

        // 2️⃣ Update approval to Approved
        await approval.update({
            status: 'Approved',
            signed_at: moment().toDate()
        }, transaction);

        // 3️⃣ Check if all approvals for this document are now approved
        const pendingApprovals = await db.Approval.count({
            where: {
                document_id: vacancyId,
                status: {
                    [Op.ne]: 'Approved' 
                },
                is_active: true
            }
        }, transaction);
        if (pendingApprovals === 0) {
            await db.Vacancy.update({ 
                    status: "Approved" 
                },
                { 
                    where: { 
                        id: vacancyId 
                    } 
                }, { transaction }
            );
            const vacancy = await db.Vacancy.findByPk(vacancyId, { transaction });
            await db.Position.update({ 
                    status: "Approved" 
                },
                { 
                    where: { 
                        id: vacancy.position_id 
                    } 
                }, { transaction }
            );
        }

        const data = await GetRecruitment(vacancyId);

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!", 
            vacancy: data
        });

    } catch (error) {

        await transaction.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Disable = async (req, res) => {

    const { 
        id 
    } = req.params;

    const transaction = await sequelize.transaction();
  
    try {

        const vacancy = await db.Vacancy.findByPk(id, { transaction });

        if (!vacancy) {
            return res.status(500).json({
                errors: [{
                    type: "manual",
                    value: "",
                    msg: "Record not found!",
                    path: "",
                    location: "body",
                }],
            });
        }

        await vacancy.update({ status: 'Rejected' }, { transaction });

        const position = await db.Position.findByPk(vacancy.position_id, { transaction });
        await position.update({ status: 'Vacant' }, { transaction });


        const data = await GetRecruitment(vacancy.id);

        await transaction.commit();

        res.status(200).json({
            message: "Record Disabled!", 
            vacancy: data 
        });

    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GeneratePDF = async (req, res) => {
    const { 
        id 
    } = req.params;
    let browser;

    const transaction = await sequelize.transaction();

    try {
        const vacancy = await db.Vacancy.findOne({
            where: { id },

            include: [
                {
                    model: db.Position,
                    as: 'position'
                },
                {
                    model: db.Department,
                    as: 'department',
                    attributes: ['name']
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
        }, transaction);

        const approvals = await db.Approval.findAll({
            where: {
                document_id: vacancy.id,
                is_active: true
            },
            include: [
                {
                    model: db.ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Vacancy'
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
                                                            as: 'position',
                                                        }
                                                    ]
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
                                                            as: 'position',
                                                        }
                                                    ]
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
            order: [
                [{ model: db.ApprovalSetting, as: 'setting' }, 'order', 'ASC']
            ]

        }, transaction);

        // 3️⃣ Combine vacancy + approvals
        const result = {
            ...vacancy.toJSON(),
            approvals
        };

        const templatePath = path.join(__dirname, '../templates/reports/Requisition.pug');

        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const controlNo = result?.control_no;
        const position = result?.position?.name;
        const department = result?.department?.name;
        const location = result?.location;
        const FormatTime = (time) => {
            if (!time) return '';
            const [h, m] = time.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        };
        const DayName = (n) => {
            const map = {
                1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday',
                5: 'Friday', 6: 'Saturday', 7: 'Sunday'
            };
            return map[Number(n)] || '';
        };
        // after you fetch vacancy:
        const days = (vacancy.shift?.days || [])
            .map(d => Number(d.day_of_week))
            .sort((a,b) => a-b)
            .map(DayName);

        const formatCurrency = (value) => {
            if (value == null || isNaN(value)) return '₱0.00';

            return new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        };


        const getSalaryRange = (position) => {
            if (!position) return 0;

            const { salary_type, monthly_salary, daily_salary, hourly_salary } = position;

            switch (salary_type) {
                case 'Monthly': {
                    const min = monthly_salary * 0.9;
                    const max = monthly_salary * 1.1;
                    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
                }

                case 'Daily': {
                    const min = daily_salary * 0.9;
                    const max = daily_salary * 1.1;
                    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
                }

                case 'Hourly': {
                    const min = hourly_salary * 0.9;
                    const max = hourly_salary * 1.1;
                    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
                }

                default:
                return 0;
            }
        };

        const timeRange = `${FormatTime(vacancy.shift?.start_time)} to ${FormatTime(vacancy.shift?.end_time)}`;
        const shift = `${days.join(', ')} ${timeRange}`;
        const dateNeeded = moment(result?.date_needed).format('MMMM DD, YYYY'); 
        const salaryRange = getSalaryRange(vacancy.position);
        const employment = result?.employment_status;
        const needBackgroundCheck = result?.need_background_check;
        const movement = result?.movement;
        const justification = result?.justification;
        const gender = result?.sex;
        const education = result?.school_level;
        const experience = result?.year_experience;
        const age = result?.age_range;
        const qualifications = result?.position?.qualification;
        const description = result?.position?.description;
        // Map approvals to the desired format
        const signatories = approvals.map((app) => {
            const employee = app?.setting?.approver?.employeeAccount?.employee;
            const profile = employee || {};

            const position = app?.setting?.approver
                ?.employeeAccount
                ?.employee
                ?.employment
                ?.position
                ?.name || '';
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

        const html = pug.renderFile(templatePath, { 
            seal, 
            controlNo,
            position,
            department,
            location,
            shift,
            dateNeeded,
            salaryRange,
            employment,
            needBackgroundCheck,
            movement,
            justification,
            gender,
            education,
            experience,
            age,
            qualifications,
            description,
            signatories
        });
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
    
        await page.setContent(html, { waitUntil: 'networkidle0' });

        await page.emulateMediaType('print');

        const width = '8.5in'
        const height = '11in'
    
        const pdfBuffer = await page.pdf({
            width: width, 
            height: height, 
            landscape: false, 
            margin: {
                top: '25px',
                bottom: '25px',
                left: '25px',
                right: '25px'
            }, 
            preferCSSPageSize: true,
            printBackground: true
        });

        const buffer = Buffer.from(pdfBuffer);

        await transaction.commit();

        res.send(buffer)

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};