const { Op } = require("sequelize");
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment');
const { Position, SalaryGrade, PositionQualification, Salary, Vacancy, Signatory, VacancyRequest, Rate, Company, Department, ScheduleShift, ScheduleClass, Sex, SchoolLevel, EmploymentStatus, User, Profile, EmploymentInformation, VacancySignatory, Approval, ApprovalSetting } = require('../models');

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {

        const { count, rows } = await Vacancy.findAndCountAll({
            include: [
                {
                    model: Salary,
                    as: 'salary',
                    include: [
                        {
                            model: Position,
                            as: 'positions',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: SalaryGrade,
                            as: 'grade',
                            attributes: [
                                'name'
                            ]
                        },
                    ]
                },
                
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

exports.GetDetails = async (req, res) => {

    const { id } = req.params;

    try {

        const vacancy = await Vacancy.findOne({
            where: { id },

            include: [
                {
                    model: Salary,
                    as: 'salary',
                    include: [
                        {
                            model: Position,
                            as: 'positions',
                            attributes: ['name', 'description'],
                            include: [
                                {
                                    model: PositionQualification,
                                    as: 'qualifications',
                                    attributes: ['name']
                                }
                            ]
                        },
                        {
                            model: SalaryGrade,
                            as: 'grade',
                            attributes: ['name']
                        },
                        {
                            model: Rate,
                            as: 'rates',
                            required: false,
                            where: {
                                stepId: { [Op.col]: 'Vacancy.stepId' }
                            }
                        }
                    ]
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
                    model: ScheduleShift,
                    as: 'shift',
                    attributes: ['timeStart', 'timeEnd'],
                    include: [
                        {
                            model: ScheduleClass,
                            as: 'class',
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: Sex,
                    as: 'sex',
                    attributes: ['name']
                },
                {
                    model: SchoolLevel,
                    as: 'schoolLevel',
                    attributes: ['name']
                },
                {
                    model: EmploymentStatus,
                    as: 'employmentStatus',
                    attributes: ['name']
                }
            ]
        });

        const approvals = await Approval.findAll({
            where: {
                documentId: vacancy.id,
                isActive: true
            },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    attributes: ['id', 'description', 'order', 'signature', 'isRequired'],
                    include: [
                        {
                            model: User,
                            as: 'approver',
                            attributes: ['id'],
                            include: [
                                { 
                                    model: Profile, as: 'profile', 
                                    attributes: [
                                        'firstname', 'middlename', 'lastname', 'suffix'
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
                        { model: Profile, as: 'profile', attributes: ['firstname', 'lastname'] }
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
        salaryId,
        stepId,
        companyId,
        departmentId,
        shiftId,
        date,
        location,
        movement,
        justification,
        needBackgroundCheck,
        sexId,
        ageRange,
        levelId,
        yearExperience,
        employmentId
    } = req.body;

    try {

        const year = new Date().getFullYear().toString();
        const latest = await Vacancy.findOne({
            where: { controlNo: { [Op.like]: `${year}-%` } },
            order: [['controlNo', 'DESC']]
        });
        let nextSeq = 1;

        if (latest) {
            const lastSeq = parseInt(latest.controlNo.split('-')[1]);
            nextSeq = lastSeq + 1;
        }
        const newNo = `${year}-${String(nextSeq).padStart(3, '0')}`;


        const vacancy = await Vacancy.create({
            controlNo: newNo,
            salaryId,
            stepId,
            companyId,
            departmentId,
            shiftId,
            dateNeeded: date,
            location,
            movement,
            justification,
            needBackgroundCheck,
            sexId,
            ageRange,
            levelId,
            yearExperience,
            employmentId,
            status: 'Requested'
        });

        const salary = await Salary.findByPk(salaryId);
        await salary.update({ 
            status: 'Requested'
        });

        // Fetch approval settings by document type
        const signatories = await ApprovalSetting.findAll({
            where: {
                type: 'Vacancy',        // 👈 use dynamic type
                isActive: true
            },
            order: [['order', 'ASC']]
        });

        for (const sig of signatories) {

            const isOwner = sig.approverId === req.user.id;
            const isFirst = sig.order === 1;

            await Approval.create({
                settingId: sig.id,
                documentId: vacancy.id,
                ownerId: req.user.id,

                // ✅ auto-approve ONLY if owner is first approver
                status: (isOwner && isFirst) ? 'Approved' : 'Pending',

                signedAt: (isOwner && isFirst) ? new Date() : null,
                remarks: (isOwner && isFirst)
                    ? 'Auto-approved (owner is first approver)'
                    : null
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
                    model: Salary,
                    as: 'salary',
                    include: [
                        {
                            model: Position,
                            as: 'positions',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: SalaryGrade,
                            as: 'grade',
                            attributes: [
                                'name'
                            ]
                        },
                    ]
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
                documentId: vacancyId,
                isActive: true
            },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Vacancy',
                        approverId: req.user.id, // ✅ filter by current approver
                        isActive: true
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
            signedAt: moment().toDate()
        });

        // 3️⃣ Check if all approvals for this document are now approved
        const pendingApprovals = await Approval.count({
            where: {
                documentId: vacancyId,
                status: { [Op.ne]: 'Approved' },
                isActive: true
            }
        });
        if (pendingApprovals === 0) {
            await Vacancy.update(
                { status: "Approved" },
                { where: { id: vacancyId } }
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
                    model: Salary,
                    as: 'salary',
                    include: [
                        {
                            model: Position,
                            as: 'positions',
                            attributes: ['name', 'description'],
                            include: [
                                {
                                    model: PositionQualification,
                                    as: 'qualifications',
                                    attributes: ['name']
                                }
                            ]
                        },
                        {
                            model: SalaryGrade,
                            as: 'grade',
                            attributes: ['name']
                        },
                        {
                            model: Rate,
                            as: 'rates',
                            required: false,
                            where: {
                                stepId: { [Op.col]: 'Vacancy.stepId' }
                            }
                        }
                    ]
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
                    model: ScheduleShift,
                    as: 'shift',
                    attributes: ['timeStart', 'timeEnd'],
                    include: [
                        {
                            model: ScheduleClass,
                            as: 'class',
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: Sex,
                    as: 'sex',
                    attributes: ['name']
                },
                {
                    model: SchoolLevel,
                    as: 'schoolLevel',
                    attributes: ['name']
                },
                {
                    model: EmploymentStatus,
                    as: 'employmentStatus',
                    attributes: ['name']
                }
            ]
        });

        const approvals = await Approval.findAll({
            where: {
                documentId: vacancy.id,
                isActive: true
            },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    attributes: ['id', 'description', 'order', 'signature', 'isRequired'],
                    include: [
                        {
                            model: User,
                            as: 'approver',
                            attributes: ['id'],
                            include: [
                                { 
                                    model: Profile, as: 'profile', 
                                    attributes: [
                                        'firstname', 'middlename', 'lastname', 'suffix'
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
                        { model: Profile, as: 'profile', attributes: ['firstname', 'lastname'] }
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

        const templatePath = path.join(__dirname, '../templates/reports/Requisition.pug');

        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const controlNo = result?.controlNo;
        const position = result?.salary?.positions?.name;
        const department = result?.department?.name;
        const location = result?.location;
        const formatTime = (t) =>
            t
                ? new Date(`1970-01-01T${t}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })
                : '';

        const timeStart = formatTime(result?.shift?.timeStart);
        const timeEnd = formatTime(result?.shift?.timeEnd);
        const shiftTime = `${timeStart} - ${timeEnd}`;
        const dateNeeded = moment(result?.dateNeeded).format('MMMM DD, YYYY'); 
        const grade = result?.salary?.grade?.name || '';
        const monthlyComp = result?.salary?.rates[0]?.monthlyCompensation || 0;
        const salary = grade
            ? `${grade} - ₱${Number(monthlyComp).toLocaleString()}`
            : `₱${Number(monthlyComp).toLocaleString()}`;
        const company = result?.company?.name;
        const employment = result?.employmentStatus?.name;
        const needBackgroundCheck = result?.needBackgroundCheck;
        const movement = result?.movement;
        const justification = result?.justification;
        const gender = result?.sex?.name;
        const education = result?.schoolLevel?.name;
        const experience = result?.yearExperience;
        const age = result?.ageRange;
        const qualifications = result?.salary?.positions?.qualifications;
        const description = result?.salary?.positions?.description;
        // Map approvals to the desired format
        const signatories = approvals.map((app) => {
            const setting = app?.setting;
            const approverUser = setting?.approver;
            const profile = approverUser?.profile;
            const employment = profile?.employment;
            const salary = employment?.salary;
            const position = salary?.positions?.name || '';

            // Format full name (First M. Last Suffix)
            const first = profile?.firstname || '';
            const middle = profile?.middlename ? `${profile.middlename.charAt(0)}.` : '';
            const last = profile?.lastname || '';
            const suffix = profile?.suffix ? ` ${profile.suffix}` : '';
            const userName = `${first} ${middle} ${last}${suffix}`.replace(/\s+/g, ' ').trim();

            // Only show signature & date if approval is approved
            const isApproved = app?.status === 'Approved';
            const signaturePath = setting?.signature; // Assuming approval setting stores the signature path

            return {
                signatoryName: setting?.description || '',
                userName,
                position,
                signature: isApproved && signaturePath
                    ? 'data:image/png;base64,' +
                    fs.readFileSync(path.join(__dirname, `../public/${signaturePath}`)).toString('base64')
                    : null,
                date: isApproved ? moment(app?.signedAt || app?.createdAt).format('MMMM DD, YYYY hh:mm A') : null,
                isSigned: isApproved
            };
        });

        const html = pug.renderFile(templatePath, { 
            seal, 
            controlNo,
            position,
            department,
            location,
            shiftTime,
            dateNeeded,
            salary,
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