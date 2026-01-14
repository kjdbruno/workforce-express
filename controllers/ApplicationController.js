const { Op } = require("sequelize");
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment');
const transporter = require('../utils/mailer');

const {
    Applicant,
    Vacancy,
    Position,
    Company,
    Department,
    Schedule,
    Course,
    School,
    ApplicantEducation,
    ApplicantTraining,
    ApplicantExperience,
    ApplicantDocument
} = require('../models');

exports.GetAll = async (req, res) => {
    
    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {
        const { count, rows } = await Applicant.findAndCountAll({
            include: [
                {
                    model: Vacancy,
                    as: 'vacancy',
                    include: [
                        {
                            model: Position,
                            as: 'position'
                        },
                    ]
                }
            ],
            where: Filter
            ? {
                [Op.or]: [
                    { '$vacancy.position.name$': { [Op.like]: `%${Filter}%` } },
                    { '$first_name$': { [Op.like]: `%${Filter}%` } },
                    { '$middle_name$': { [Op.like]: `%${Filter}%` } },
                    { '$last_ame$': { [Op.like]: `%${Filter}%` } }
                ]
            }
            : undefined,
            subQuery: false,
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

exports.GetVacancy = async (req, res) => {
    try {
        const data = await Vacancy.findAll({
            where: {
                status: 'Approved'
            },
            include: [
                {
                    model: Position,
                    as: 'position'
                },
                {
                    model: Company,
                    as: 'company'
                },
                {
                    model: Department,
                    as: 'department'
                },
                {
                    model: Schedule,
                    as: 'schedule'
                }
            ]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};
exports.GetCourse = async (req, res) => {
    try {
        const data = await Course.findAll({
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
exports.GetSchool = async (req, res) => {
    try {
        const data = await School.findAll({
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
    
    const { 
        id 
    } = req.params;

    try {
        
        const rows  = await Applicant.findOne({
            include: [
                {
                    model: ApplicantDocument,
                    as: 'documents',
                    attributes: [
                        'filename', 'document'
                    ]
                },
                {
                    model: ApplicantEducation,
                    as: 'educations',
                    attributes: [
                        'school_level', 'start_date', 'end_date'
                    ],
                    include: [
                        {
                            model: School,
                            as: 'school',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Course,
                            as: 'course',
                            attributes: [
                                'name'
                            ]
                        },
                    ]
                },
                {
                    model: ApplicantTraining,
                    as: 'trainings',
                    attributes: [
                        'title', 'type', 'start_date', 'end_date', 'hour'
                    ]
                },
                {
                    model: ApplicantExperience,
                    as: 'experiences',
                    attributes: [
                        'position', 'start_date', 'end_date', 'description'
                    ]
                },
                {
                    model: Vacancy,
                    as: 'vacancy',
                    include: [
                        {
                            model: Position,
                            as: 'position',
                            attributes: [
                                'name', 'description', 'qualification'
                            ]
                        },
                        {
                            model: Company,
                            as: 'company',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Department,
                            as: 'department',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Schedule,
                            as: 'schedule',
                            attributes: [
                                "name", "time_start", "time_end"
                            ]
                        }
                    ]
                }
            ],
            where: {
                id
            }
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

const GetApplicant = async (id) => {
    return await Applicant.findOne({
        include: [
            {
                model: ApplicantDocument,
                as: 'documents',
                attributes: [
                    'filename', 'document'
                ]
            },
            {
                model: ApplicantEducation,
                as: 'educations',
                attributes: [
                    'school_level', 'start_date', 'end_date'
                ],
                include: [
                    {
                        model: School,
                        as: 'school',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: Course,
                        as: 'course',
                        attributes: [
                            'name'
                        ]
                    },
                ]
            },
            {
                model: ApplicantTraining,
                as: 'trainings',
                attributes: [
                    'title', 'type', 'start_date', 'end_date', 'hour'
                ]
            },
            {
                model: ApplicantExperience,
                as: 'experiences',
                attributes: [
                    'position', 'start_date', 'end_date', 'description'
                ]
            },
            {
                model: Vacancy,
                as: 'vacancy',
                include: [
                    {
                        model: Position,
                        as: 'position',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: Company,
                        as: 'company',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: Department,
                        as: 'department',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: Schedule,
                        as: 'schedule',
                        attributes: [
                            "name", "time_start", "time_end"
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

exports.Create = async (req, res) => {
    const {
        vacancyId,
        firstname,
        middlename,
        lastname,
        suffix,
        sex,
        civilstatus,
        birthdate,
        birthplace,
        bloodtype,
        email,
        contactNo,
        address,
        educations,
        trainings,
        experiences
    } = req.body;

    const mail = email.toLowerCase();

    const files = req.files || [];
    const educ = JSON.parse(educations || "[]");
    const train = JSON.parse(trainings || "[]");
    const exp = JSON.parse(experiences || "[]");

    const t = await Applicant.sequelize.transaction();

    try {
        const applicant = await Applicant.create({
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
            blood_type: bloodtype,
            contact_number: contactNo,
            email
        }, { transaction: t });
        
        for (const edu of educ) {
            await ApplicantEducation.create({
                applicant_id: applicant.id,
                school_level: edu.schoollevel,
                school_id: edu.schoolId,
                course_id: edu.courseId,
                start_date: edu.startDate,
                end_date: edu.endDate
            }, { transaction: t });
        }
        
        for (const tr of train) {
            await ApplicantTraining.create({
                applicant_id: applicant.id,
                title: tr.title,
                type: tr.trainingtype,
                start_date: tr.startDate,
                end_date: tr.endDate,
                hour: tr.hour
            }, { transaction: t });
        }
        
        for (const ex of exp) {
        await ApplicantExperience.create({
            applicant_id: applicant.id,
            position: ex.position,
            start_date: ex.startDate,
            end_date: ex.endDate,
            description: ex.description
        }, { transaction: t });
        }
        
        for (const file of files) {
            const filePath = `/documents/${file.filename}`;
            await ApplicantDocument.create({
                applicant_id: applicant.id,
                document: filePath,
                filename: file.originalname
            }, { transaction: t });
        }
        
        await t.commit();

        const data = await GetApplicant(applicant.id);
        const position = data.vacancy.position.name;

        try {
            const templatePath = path.join(__dirname, '../templates/NewApplication.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');
            htmlContent = htmlContent
                .replace(/{{\s*firstname\s*}}/g, firstname || 'Applicant')
                .replace(/{{\s*position\s*}}/g, position || 'a position');

            const mailOptions = {
                from: `"Recruitment Team" <${process.env.MAIL_USER}>`,
                to: mail,
                subject: 'Application Status: Considered for Talent Pooling',
                html: htmlContent,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
        }

        res.status(201).json({
            message: "Record Saved Successfully!",
            application: data
        });

    } catch (error) {
        await t.rollback();
        console.error('Error creating application:', error);
        res.status(400).json({
            message: "Failed to create record.",
            error: error.message
        });
    }
};

exports.Update = async (req, res) => {

    const { 
        id 
    } = req.params;

    const { 
        status
    } = req.body;

    try {

        const application = await Applicant.findByPk(id);
        if (!application) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: status,
                    msg: "Record not found!",
                    path: "applicationstatus",
                    location: "body",
                }],
            });
        }
        await application.update({ 
            status
        });

        const vacancy = await Vacancy.findByPk(application.vacancy_id);
        if (!vacancy) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: status,
                    msg: "Record not found!",
                    path: "applicationstatus",
                    location: "body",
                }],
            });
        }
        await vacancy.update({ 
            status: 'Filled'
        });
        await Position.update({ 
            status: 'Filled' 
        }, {
            where: {
                id: vacancy.position_id
            }
        });

        const data = await GetApplicant(application.id);
        const email = data.email;
        const firstname = data.first_name;
        const position = data.vacancy.position.name;
        
        try {
            let templatePath;
            let subject;
            if (status == 'Shortlisted') {
                templatePath = path.join(__dirname, '../templates/ShortlistedApplication.html');
                subject = 'Application Status: Shortlisted';
            } else if (status == 'Interview') {
                templatePath = path.join(__dirname, '../templates/InterviewApplication.html');
                subject = 'Application Status: For Interview';
            } else if (status == 'Hired') {
                templatePath = path.join(__dirname, '../templates/HiredApplication.html');
                subject = 'Application Status: Hired';
            } else if (status == 'Rejected') {
                templatePath = path.join(__dirname, '../templates/RejectedApplication.html');
                subject = 'Application Status: Rejected';
            } else if (status == 'Withdrawn') {
                templatePath = path.join(__dirname, '../templates/WithdrawnApplication.html');
                subject = 'Application Status: Withdrawn';
            }
            let htmlContent = fs.readFileSync(templatePath, 'utf8');
            htmlContent = htmlContent
                .replace(/{{\s*firstname\s*}}/g, firstname || 'Applicant')
                .replace(/{{\s*position\s*}}/g, position || 'a position');

            const mailOptions = {
                from: `"Recruitment Team" <${process.env.MAIL_USER}>`,
                to: email,
                subject,
                html: htmlContent,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
        }

        res.status(201).json({
            message: "Record Modified!", 
            application: data
        });

    } catch (error) {

        res.status(400).json({ 
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
        const rows  = await Applicant.findOne({
            include: [
                {
                    model: ApplicantDocument,
                    as: 'documents',
                    attributes: [
                        'filename', 'document'
                    ]
                },
                {
                    model: ApplicantEducation,
                    as: 'educations',
                    attributes: [
                        'school_level', 'start_date', 'end_date'
                    ],
                    include: [
                        {
                            model: School,
                            as: 'school',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Course,
                            as: 'course',
                            attributes: [
                                'name'
                            ]
                        },
                    ]
                },
                {
                    model: ApplicantTraining,
                    as: 'trainings',
                    attributes: [
                        'title', 'type', 'start_date', 'end_date', 'hour'
                    ]
                },
                {
                    model: ApplicantExperience,
                    as: 'experiences',
                    attributes: [
                        'position', 'start_date', 'end_date', 'description'
                    ]
                },
                {
                    model: Vacancy,
                    as: 'vacancy',
                    include: [
                        {
                            model: Position,
                            as: 'position',
                            attributes: [
                                'name', 'description', 'qualification'
                            ]
                        },
                        {
                            model: Company,
                            as: 'company',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Department,
                            as: 'department',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Schedule,
                            as: 'schedule',
                            attributes: [
                                "name", "time_start", "time_end"
                            ]
                        }
                    ]
                }
            ],
            where: {
                id
            }
        });

        const templatePath = path.join(__dirname, '../templates/reports/Application.pug');

        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const getFullName = (profile) => {
            if (!profile) return '';

            const first = profile.first_name || '';
            const middle = profile.middle_name
                ? ` ${profile.middle_name.charAt(0).toUpperCase()}.`
                : '';
            const last = profile.last_name || '';
            const suffix = profile.suffix ? ` ${profile.suffix}` : '';

            return `${first}${middle} ${last}${suffix}`.replace(/\s+/g, ' ').trim();
        };
        const name = getFullName(rows);
        const sex = rows?.sex || '';
        const maritalStatus = rows?.civil_status || '';
        const birthdate = rows?.birthdate
            ? moment(rows.birthdate).format('MMMM DD, YYYY')
            : '';
        const birthplace = rows?.birthplace || '';
        const address = rows?.address || '';
        const bloodType = rows?.blood_type || '';
        const email = rows?.email || '';
        const contactNo = rows?.contact_number || '';
        const educations = rows?.educations?.map(edu => ({
            level: edu?.school_level || '',
            school: edu?.school?.name || '',
            schoolType: edu?.school?.type || '',
            course: edu?.course?.name || '',
            startDate: edu?.start_date
                ? moment(edu.start_date).format('MMMM YYYY')
                : '',
            endDate: edu?.end_date
                ? moment(edu.end_date).format('MMMM YYYY')
                : ''
        })) || [];
        const trainings = rows?.trainings?.map(t => ({
            title: t?.title || '',
            type: t?.training_ype || null,
            startDate: t?.start_date
                ? moment(t.start_date).format('MMMM YYYY')
                : '',
            endDate: t?.end_date
                ? moment(t.end_date).format('MMMM YYYY')
                : '',
            hours: t?.hour || ''
        })) || [];
        const experiences = rows?.experiences?.map(e => ({
            position: e?.position || '',
            jobDescription: e?.description || '',
            startDate: e?.start_date
                ? moment(e.start_date).format('MMMM YYYY')
                : '',
            endDate: e?.end_date
                ? moment(e.end_date).format('MMMM YYYY')
                : ''
        })) || [];
        const documents = rows?.documents?.map(d => ({
            filename: d?.filename || ''
        })) || [];


        const html = pug.renderFile(templatePath, { 
            seal,
            name, 
            sex,
            maritalStatus,
            birthdate,
            birthplace,
            address,
            bloodType,
            email,
            contactNo,
            educations,
            trainings,
            experiences,
            documents
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