const { Op } = require("sequelize");
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment');
const { Position, SalaryGrade, PositionQualification, Salary, Vacancy, Signatory, VacancyRequest, Rate, Company, Department, ScheduleShift, ScheduleClass, Sex, SchoolLevel, EmploymentStatus, User, Profile, EmploymentInformation } = require('../models');

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

    const { 
        id 
    } = req.params;

    try {

        const rows  = await Vacancy.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Salary,
                    as: 'salary',
                    include: [
                        {
                            model: Position,
                            as: 'positions',
                            attributes: [
                                'name', 'description'
                            ],

                            include: [
                                {
                                    model: PositionQualification,
                                    as: 'qualifications',
                                    attributes: [
                                        'name'
                                    ]
                                }
                            ]
                        },
                        {
                            model: SalaryGrade,
                            as: 'grade',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Rate,
                            as: 'rates',
                            required: false,
                            where: {
                                stepId: { [Op.col]: "Vacancy.stepId" }
                            }
                        }
                    ]
                },
                {
                    model: Company,
                    as: 'company',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: ScheduleShift,
                    as: 'shift',
                    attributes: [
                        "timeStart", "timeEnd"
                    ],
                    include: [
                        {
                            model: ScheduleClass,
                            as: 'class',
                            attributes: [
                                "name"
                            ]
                        }
                    ]
                },
                {
                    model: Sex,
                    as: 'sex',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: SchoolLevel,
                    as: 'schoolLevel',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: EmploymentStatus,
                    as: 'employmentStatus',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: VacancyRequest,
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
                    { model: VacancyRequest, as: 'requests' },
                    { model: Signatory, as: 'signatory' },
                        'order',
                        'ASC'
                ],
            ]
        });

        res.json({
            data: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

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

        const signatories = await Signatory.findAll({
            where: {
                typeId: 1
            }
        });
        if (signatories.length > 0) {
            const requestsData = signatories.map(signatory => ({
                vacancyId: vacancy.id,
                signatoryId: signatory.id
            }));
            await VacancyRequest.bulkCreate(requestsData);
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
        vacancyId,
        signatoryId
    } = req.body;

    try {
        const requests = await VacancyRequest.findOne({
            where: {
                vacancyId,
                signatoryId,
                isActive: true
            }
        });
        if (!requests) {
            return res.status(500).json({
                errors: [{
                    type: "manual",
                    value: "",
                    msg: "Record not found!",
                    path: "name",
                    location: "body",
                }],
            });
        }
        await requests.update({ 
            status: 'Approved'
        });

        const pendingRequests = await VacancyRequest.count({
            where: {
                vacancyId,
                status: { [Op.ne]: "Approved" },
                isActive: true
            }
        });
        if (pendingRequests === 0) {
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
        const rows  = await Vacancy.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Salary,
                    as: 'salary',
                    include: [
                        {
                            model: Position,
                            as: 'positions',
                            attributes: [
                                'name', 'description'
                            ],

                            include: [
                                {
                                    model: PositionQualification,
                                    as: 'qualifications',
                                    attributes: [
                                        'name'
                                    ]
                                }
                            ]
                        },
                        {
                            model: SalaryGrade,
                            as: 'grade',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Rate,
                            as: 'rates',
                            required: false,
                            where: {
                                stepId: { [Op.col]: "Vacancy.stepId" }
                            }
                        }
                    ]
                },
                {
                    model: Company,
                    as: 'company',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: ScheduleShift,
                    as: 'shift',
                    attributes: [
                        "timeStart", "timeEnd"
                    ],
                    include: [
                        {
                            model: ScheduleClass,
                            as: 'class',
                            attributes: [
                                "name"
                            ]
                        }
                    ]
                },
                {
                    model: Sex,
                    as: 'sex',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: SchoolLevel,
                    as: 'schoolLevel',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: EmploymentStatus,
                    as: 'employmentStatus',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: VacancyRequest,
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
                                            as: 'profile',
                                            include: [
                                                {
                                                    model: EmploymentInformation,
                                                    as: 'employment',
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
                    ]
                }
            ],
            order: [
                [
                    { model: VacancyRequest, as: 'requests' },
                    { model: Signatory, as: 'signatory' },
                        'order',
                        'ASC'
                ],
            ]
        });

        const templatePath = path.join(__dirname, '../templates/reports/Requisition.pug');

        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const controlNo = rows?.controlNo;
        const position = rows?.salary?.positions?.name;
        const department = rows?.department?.name;
        const location = rows?.location;
        const formatTime = (t) =>
            t
                ? new Date(`1970-01-01T${t}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })
                : '';

        const timeStart = formatTime(rows?.shift?.timeStart);
        const timeEnd = formatTime(rows?.shift?.timeEnd);
        const shiftTime = `${timeStart} - ${timeEnd}`;
        const dateNeeded = moment(rows?.dateNeeded).format('MMMM DD, YYYY'); 
        const grade = rows?.salary?.grade?.name || '';
        const monthlyComp = rows?.salary?.rates[0]?.monthlyCompensation || 0;
        const salary = grade
            ? `${grade} - ₱${Number(monthlyComp).toLocaleString()}`
            : `₱${Number(monthlyComp).toLocaleString()}`;
        const company = rows?.company?.name;
        const employment = rows?.employmentStatus?.name;
        const needBackgroundCheck = rows?.needBackgroundCheck;
        const movement = rows?.movement;
        const justification = rows?.justification;
        const gender = rows?.sex?.name;
        const education = rows?.schoolLevel?.name;
        const experience = rows?.yearExperience;
        const age = rows?.ageRange;
        const qualifications = rows?.salary?.positions?.qualifications;
        const description = rows?.salary?.positions?.description;
        const signatories =
            rows?.requests?.map((req) => {
                const profile = req?.signatory?.user?.profile;
                const employment = profile?.employment;
                const salary = employment?.salary;
                const position = salary?.positions?.name || '';

                // Format full name (First M. Last Suffix)
                const first = profile?.firstname || '';
                const middle = profile?.middlename ? `${profile.middlename.charAt(0)}.` : '';
                const last = profile?.lastname || '';
                const suffix = profile?.suffix ? ` ${profile.suffix}` : '';
                const userName = `${first} ${middle} ${last}${suffix}`.replace(/\s+/g, ' ').trim();

                // Only show signature & date if request is approved
                const isApproved = req?.status === 'Approved';

                return {
                    signatoryName: req?.signatory?.name || '',
                    userName,
                    position,
                    signature: isApproved
                        ? 'data:image/png;base64,' +
                        fs
                            .readFileSync(path.join(__dirname, `../public/${req?.signatory?.signature}`))
                            .toString('base64')
                        : null, // or '' if you prefer
                    date: isApproved ? moment(req?.createdAt).format('MMMM DD, YYYY') : null,
                    isSigned: isApproved
                };
        }) || [];


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