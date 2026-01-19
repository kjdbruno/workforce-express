const { Op, Sequelize  } = require("sequelize");
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment');
const { Approval, ApprovalSetting, Vacancy, Position, Company, Department, Schedule, SchoolLevel, User, EmployeeAccount, Employee, Employment } = require('../models');

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {

        const { count, rows } = await Vacancy.findAndCountAll({
            include: [
                {
                    model: Position,
                    as: 'position',
                    attributes: [
                        'name', 'salary_type'
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
        const data = await Position.findAll({
            where: {
                is_active: true
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

exports.GetCompany = async (req, res) => {
    try {
        const data = await Company.findAll({
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
exports.GetDepartment = async (req, res) => {
    try {
        const data = await Department.findAll({
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
exports.GetSchedule = async (req, res) => {
    try {
        const data = await Schedule.findAll({
            where: {
                is_active: true
            },
            attributes: [
                ['id', 'value'],
                ['name', "label"],
                'time_start',
                'time_end'
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
exports.GetSchoolLevel = async (req, res) => {
    try {
        const data = await SchoolLevel.findAll({
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

exports.GetDetails = async (req, res) => {

    const { id } = req.params;

    try {

        const vacancy = await Vacancy.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: Position,
                    as: 'position'
                },
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
                    model: Schedule,
                    as: 'schedule'
                }
            ]
        });

        const approvals = await Approval.findAll({
            where: {
                document_id: vacancy.id,
                is_active: true
            },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Vacancy'
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
                                                    include: [
                                                        {
                                                            model: Position,
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
                                                    include: [
                                                        {
                                                            model: Position,
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
                [{ model: ApprovalSetting, as: 'setting' }, 'order', 'ASC']
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
        companyId,
        departmentId,
        scheduleId,
        salaryRange,
        date,
        location,
        movement,
        justification,
        needBackgroundCheck,
        sex,
        ageRange,
        schoolLevel,
        yearExperience,
        employmentStatus
    } = req.body;

    try {

        const year = new Date().getFullYear().toString();
        const latest = await Vacancy.findOne({
            where: { control_no: { [Op.like]: `${year}-%` } },
            order: [['control_no', 'DESC']]
        });
        let nextSeq = 1;

        if (latest) {
            const lastSeq = parseInt(latest.control_no.split('-')[1]);
            nextSeq = lastSeq + 1;
        }
        const newNo = `${year}-${String(nextSeq).padStart(3, '0')}`;

        const vacancy = await Vacancy.create({
            control_no: newNo,
            position_id: positionId,
            company_id: companyId,
            department_id: departmentId,
            schedule_id: scheduleId,
            salary_range: salaryRange,
            date_needed: date,
            location,
            movement,
            justification,
            need_background_check: needBackgroundCheck,
            sex: sex,
            age_range: ageRange,
            school_level: schoolLevel,
            year_experience: yearExperience,
            employment_status: employmentStatus,
            status: 'Requested'
        });

        await Position.update(
            { 
                status: 'Requested' 
            },
            { 
                where: { 
                    id: positionId 
                } 
            }
        );

        // Fetch approval settings by document type
        const signatories = await ApprovalSetting.findAll({
            where: {
                owner_id: req.user.id,
                type: 'Vacancy',
                is_active: true
            },
            order: [['order', 'ASC']]
        });

        for (const sig of signatories) {

            const isFirstApprover = sig.order === 1;

            await Approval.create({
                setting_id: sig.id,
                document_id: vacancy.id,
                status: isFirstApprover ? 'Approved' : 'Pending',
                signed_at: isFirstApprover ? new Date() : null,
                remarks: isFirstApprover ? 'Auto-approved (owner is first approver)' : null,
                is_active: true
            });
        }


        res.status(201).json({
            message: "Record Saved!", 
            vacancy: vacancy
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

const GetRecruitment = async (id) => {

    return await Vacancy.findOne({
        include: [
                {
                    model: Position,
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

    try {
        // 1️⃣ Find the Approval record for this approver
        const approval = await Approval.findOne({
            where: {
                document_id: vacancyId,
                is_active: true
            },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Vacancy',
                        approver_id: req.user.id, // ✅ filter by current approver
                        is_active: true
                    }
                }
            ]
        });

        if (!approval) {
            return res.status(404).json({
                message: 'Approval record not found for this document and approver.'
            });
        }

        // 2️⃣ Update approval to Approved
        await approval.update({
            status: 'Approved',
            signed_at: moment().toDate()
        });

        // 3️⃣ Check if all approvals for this document are now approved
        const pendingApprovals = await Approval.count({
            where: {
                document_id: vacancyId,
                status: {
                    [Op.ne]: 'Approved' 
                },
                is_active: true
            }
        });
        if (pendingApprovals === 0) {
            await Vacancy.update(
                { 
                    status: "Approved" 
                },
                { 
                    where: { 
                        id: vacancyId 
                    } 
                }
            );
        }

        const data = await GetRecruitment(vacancyId);

        res.status(201).json({
            message: "Record Saved!", 
            vacancy: data
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Disable = async (req, res) => {

    const { 
        id 
    } = req.params;
  
    try {

        const vacancy = await Vacancy.findByPk(id);

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

        await vacancy.update({ 
            isActive: false
        });

        const salary = await Salary.findByPk(vacancy.salaryId);
        await salary.update({ 
            status: 'Vacant'
        });

        const data = await GetRecruitment(vacancy.id);

        res.status(200).json({
            message: "Record Disabled!", 
            vacancy: data 
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.Enable = async (req, res) => {

    const { 
        id 
    } = req.params;
  
    try {

        const vacancy = await Vacancy.findByPk(id);

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

        await vacancy.update({ 
            isActive: true 
        });

        const salary = await Salary.findByPk(vacancy.salaryId);
        await salary.update({ 
            status: 'Requested'
        });

        const data = await GetRecruitment(vacancy.id);

        res.status(200).json({
            message: "Record Enabled!.", 
            vacancy: data
        });
    } catch (error) {

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
    try {
        const vacancy = await Vacancy.findOne({
            where: { id },

            include: [
                {
                    model: Position,
                    as: 'position'
                },
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
                    model: Schedule,
                    as: 'schedule',
                    attributes: ['time_start', 'time_end']
                }
            ]
        });

        const approvals = await Approval.findAll({
            where: {
                document_id: vacancy.id,
                is_active: true
            },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Vacancy'
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
                                                    include: [
                                                        {
                                                            model: Position,
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
                },
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id']
                }
            ],
            order: [
                [
                    { 
                        model: ApprovalSetting, as: 'setting' 
                    }, 
                    'order', 'ASC'
                ]
            ]
        });

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
        const formatTime = (t) =>
            t
                ? new Date(`1970-01-01T${t}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })
                : '';

        const timeStart = formatTime(result?.schedule?.time_start);
        const timeEnd = formatTime(result?.schedule?.time_end);
        const scheduleTime = `${timeStart} - ${timeEnd}`;
        const dateNeeded = moment(result?.date_needed).format('MMMM DD, YYYY'); 
        const salaryRange = result?.salary_range || 0;
        const company = result?.company?.name;
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

        const html = pug.renderFile(templatePath, { 
            seal, 
            controlNo,
            position,
            department,
            location,
            scheduleTime,
            dateNeeded,
            salaryRange,
            company,
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
``
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
        res.send(buffer)

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};