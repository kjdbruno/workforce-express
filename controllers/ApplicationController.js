const { Op } = require("sequelize");
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment');
const transporter = require('../utils/mailer');

const db = require('../models');
const { sequelize } = db;

exports.GetAll = async (req, res) => {
    
    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {
        const { count, rows } = await db.Applicant.findAndCountAll({
            include: [
                {
                    model: db.Vacancy,
                    as: 'vacancy',
                    required: false,
                    include: [
                        {
                            model: db.Position,
                            as: 'position',
                            required: false,
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
                    { '$last_name$': { [Op.like]: `%${Filter}%` } }
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
        const data = await db.Vacancy.findAll({
            where: {
                status: 'Approved'
            },
            include: [
                {
                    model: db.Position,
                    as: 'position',
                    include: [
                        {
                            model: db.Department,
                            as: 'department'
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
        const data = await db.Course.findAll({
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
        const data = await db.School.findAll({
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
        
        const rows  = await db.Applicant.findOne({
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
                        ]
                    },
                    {
                        model: db.Department,
                        as: 'department',
                        attributes: [
                            'name'
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

exports.Create = async (req, res) => {
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

    // ✅ Email sending should not break the request
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
};


exports.Update = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

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
};

exports.GeneratePDF = async (req, res) => {
    const { 
        id 
    } = req.params;
    let browser;
    try {
        const rows  = await db.Applicant.findOne({
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
                                'name', 'description', 'qualification'
                            ]
                        },
                        {
                            model: db.Department,
                            as: 'department',
                            attributes: [
                                'name'
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
            type: t?.type,
            startDate: t?.start_date
                ? moment(t.start_date).format('MMMM YYYY')
                : '',
            endDate: t?.end_date
                ? moment(t.end_date).format('MMMM YYYY')
                : '',
            hours: t?.hour
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