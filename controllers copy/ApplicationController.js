const { Op } = require("sequelize");
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment');
const transporter = require('../utils/mailer');

const { Profile, 
    Application, 
    ProfileEducation, 
    ProfileTraining, 
    ProfileExperience, 
    ProfileDocument, 
    SchoolLevel, 
    School, 
    Course, 
    Vacancy, 
    Position, 
    Salary, 
    SalaryGrade, 
    Rate, 
    Sex, 
    CivilStatus, 
    BloodType, 
    Region, 
    Province, 
    Town, 
    Barangay, 
    ProfileContactInformation, 
    PositionQualification, 
    Company, 
    Department, 
    ScheduleShift, 
    ScheduleClass, 
    EmploymentStatus, 
    TrainingType
} = require('../models');

exports.GetAll = async (req, res) => {
    
    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {
        
        const { count, rows } = await Application.findAndCountAll({
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    attributes: [
                        'firstname', 
                        'middlename', 
                        'lastname',
                        'suffix',
                    ]
                },
                {
                    model: Vacancy,
                    as: 'vacancy',
                    attributes: [
                        'id'
                    ],
                    include: [
                        {
                            model: Salary,
                            as: 'salary',
                            attributes: [
                                'id'
                            ],
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
                                {
                                    model: Rate,
                                    as: 'rates',
                                    required: false,
                                    where: {
                                        stepId: { [Op.col]: "vacancy.stepId" }
                                    },
                                    attributes: [
                                        'monthlyCompensation', 'dailyCompensation', 'hourlyCompensation'
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ],
            where: Filter
            ? {
                [Op.or]: [
                    { '$vacancy.position.name$': { [Op.like]: `%${Filter}%` } },
                    { '$profile.firstName$': { [Op.like]: `%${Filter}%` } },
                    { '$profile.middleName$': { [Op.like]: `%${Filter}%` } },
                    { '$profile.lastName$': { [Op.like]: `%${Filter}%` } }
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

exports.GetDetails = async (req, res) => {
    
    const { 
        id 
    } = req.params;

    try {
        
        const rows  = await Application.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    attributes: [
                        'firstname', 
                        'middlename', 
                        'lastname',
                        'suffix',
                        'birthdate',
                        'birthplace',
                        'weight',
                        'height',
                        'streetAddress',
                        'email',
                        'contactNo'
                    ],
                    include: [
                        {
                            model: Sex,
                            as: 'sex',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: CivilStatus,
                            as: 'civilStatus',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: BloodType,
                            as: 'bloodType',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Region,
                            as: 'region',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Province,
                            as: 'province',
                            attributes: [
                                'name'
                            ]    
                        },
                        {
                            model: Town,
                            as: 'town',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Barangay,
                            as: 'barangay',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: ProfileEducation,
                            as: 'educations',
                            attributes: [
                                'startDate', 'endDate', 'rating', 'graduated'
                            ],
                            where: {
                                isActive: true
                            },
                            include: [
                                {
                                    model: SchoolLevel,
                                    as: 'level',
                                    attributes: [
                                        "name"
                                    ]
                                },
                                {
                                    model: School,
                                    as: 'school',
                                    attributes: [
                                        'name', 'type', 'website', 'contactNo'
                                    ]
                                },
                                {
                                    model: Course,
                                    as: 'course',
                                    attributes: [
                                        'name'
                                    ]
                                }
                            ]
                        },
                        {
                            model: ProfileTraining,
                            as: 'trainings',
                            attributes: [
                                'title', 'startDate', 'endDate', 'hour', 'typeId', 'conductedBy'
                            ],
                            where: {
                                isActive: true
                            },
                        },
                        {
                            model: ProfileExperience,
                            as: 'experiences',
                            attributes: [
                                'position', 'jobDescription', 'startDate', 'endDate'
                            ],
                            where: {
                                isActive: true
                            },
                        },
                        {
                            model: ProfileDocument,
                            as: 'documents',
                            attributes: [
                                'filename', 'file'
                            ]
                        }
                    ]
                },
                {
                    model: Vacancy,
                    as: 'vacancy',
                    attributes: [
                        'id',
                        'dateNeeded',
                        'location',
                        'movement',
                        'justification',
                        'needBackgroundCheck',
                        'ageRange',
                        'yearExperience',
                        'status'
                    ],
                    include: [
                        {
                            model: Salary,
                            as: 'salary',
                            attributes: [
                                'id'
                            ],
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
                                        },
                                        
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
                                        stepId: { [Op.col]: "vacancy.stepId" }
                                    },
                                    attributes: [
                                        'monthlyCompensation', 'dailyCompensation', 'hourlyCompensation'
                                    ]
                                }
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
                        }
                    ]
                }
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

const GetApplicant = async (id) => {
    return await Application.findOne({
        include: [
            {
                model: Profile,
                as: 'profile',
                attributes: [
                    'firstname', 
                    'middlename', 
                    'lastname',
                    'suffix',
                    'birthdate',
                    'birthplace',
                    'weight',
                    'height',
                    'streetAddress'
                ],
                include: [
                    {
                        model: Sex,
                        as: 'sex',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: CivilStatus,
                        as: 'civilStatus',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: BloodType,
                        as: 'bloodType',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: Region,
                        as: 'region',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: Province,
                        as: 'province',
                        attributes: [
                            'name'
                        ]    
                    },
                    {
                        model: Town,
                        as: 'town',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: Barangay,
                        as: 'barangay',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: ProfileEducation,
                        as: 'educations',
                        attributes: [
                            'startDate', 'endDate', 'rating', 'graduated'
                        ],
                        where: {
                            isActive: true
                        },
                        include: [
                            {
                                model: SchoolLevel,
                                as: 'level',
                                attributes: [
                                    "name"
                                ]
                            },
                            {
                                model: School,
                                as: 'school',
                                attributes: [
                                    'name', 'type', 'website', 'contactNo'
                                ]
                            },
                            {
                                model: Course,
                                as: 'course',
                                attributes: [
                                    'name'
                                ]
                            }
                        ]
                    },
                    {
                        model: ProfileTraining,
                        as: 'trainings',
                        attributes: [
                            'title', 'startDate', 'endDate', 'hour', 'typeId', 'conductedBy'
                        ],
                        where: {
                            isActive: true
                        },
                    },
                    {
                        model: ProfileExperience,
                        as: 'experiences',
                        attributes: [
                            'position', 'jobDescription', 'startDate', 'endDate'
                        ],
                        where: {
                            isActive: true
                        },
                    },
                    {
                        model: ProfileDocument,
                        as: 'documents',
                        attributes: [
                            'filename', 'file'
                        ]
                    }
                ]
            },
            {
                model: Vacancy,
                as: 'vacancy',
                attributes: [
                    'id',
                    'dateNeeded',
                    'location',
                    'movement',
                    'justification',
                    'needBackgroundCheck',
                    'ageRange',
                    'yearExperience'
                ],
                include: [
                    {
                        model: Salary,
                        as: 'salary',
                        attributes: [
                            'id'
                        ],
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
                                    },
                                    
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
                                    stepId: { [Op.col]: "vacancy.stepId" }
                                },
                                attributes: [
                                    'monthlyCompensation', 'dailyCompensation', 'hourlyCompensation'
                                ]
                            }
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
        sexId,
        maritalId,
        birthdate,
        birthplace,
        weight,
        height,
        bloodTypeId,
        email,
        contactNo,
        regionId,
        provinceId,
        townId,
        barangayId,
        streetAddress,
        educations,
        trainings,
        experiences
    } = req.body;

    const mail = email.toLowerCase();

    const files = req.files || [];
    const educ = JSON.parse(educations || "[]");
    const train = JSON.parse(trainings || "[]");
    const exp = JSON.parse(experiences || "[]");

    const t = await Profile.sequelize.transaction();

    try {
        const profile = await Profile.create({
            firstname,
            middlename,
            lastname,
            suffix,
            sexId,
            civilStatusId: maritalId,
            birthdate,
            birthplace,
            regionId,
            provinceId,
            townId,
            barangayId,
            streetAddress,
            weight,
            height,
            bloodTypeId,
            contactNo,
            email
        }, { transaction: t });
        
        const application = await Application.create({
            profileId: profile.id,
            vacancyId
        }, { transaction: t });
        
        for (const edu of educ) {
            await ProfileEducation.create({
                profileId: profile.id,
                levelId: edu.levelId,
                schoolId: edu.schoolId,
                courseId: edu.courseId,
                rating: edu.rating,
                startDate: edu.startDate,
                endDate: edu.endDate,
                graduated: edu.yearGraduated
            }, { transaction: t });
        }
        
        for (const tr of train) {
            await ProfileTraining.create({
                profileId: profile.id,
                title: tr.title,
                typeId: tr.typeId,
                startDate: tr.startDate,
                endDate: tr.endDate,
                hour: tr.hour,
                conductedBy: tr.conductedBy,
            }, { transaction: t });
        }
        
        for (const ex of exp) {
        await ProfileExperience.create({
            profileId: profile.id,
            position: ex.position,
            startDate: ex.startDate,
            endDate: ex.endDate,
            jobDescription: ex.description
        }, { transaction: t });
        }
        
        for (const file of files) {
            const filePath = `/documents/${file.filename}`;
            await ProfileDocument.create({
                profileId: profile.id,
                file: filePath,
                filename: file.originalname
            }, { transaction: t });
        }
        
        await t.commit();

        const data = await GetApplicant(application.id);
        const position = data.vacancy.salary.positions.name;

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

        const application = await Application.findByPk(id);
        if (!application) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: status,
                    msg: "Record not found!",
                    path: "applicationStatus",
                    location: "body",
                }],
            });
        }
        await application.update({ 
            status
        });

        const vacancy = await Vacancy.findByPk(application.vacancyId);
        if (!vacancy) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: status,
                    msg: "Record not found!",
                    path: "applicationStatus",
                    location: "body",
                }],
            });
        }
        await vacancy.update({ 
            status: 'Filled'
        });

        const data = await GetApplicant(application.id);
        const email = data.profile.email;
        const firstname = data.profile.firstname;
        const position = data.vacancy.salary.positions.name;
        
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

exports.Disable = async (req, res) => {

    // const { 
    //     id 
    // } = req.params;
  
    // try {

    //     const sex = await Sex.findByPk(id);

    //     if (!sex) {
    //         return res.status(500).json({
    //             errors: [{
    //                 type: "field",
    //                 value: id,
    //                 msg: "Record not found!",
    //                 path: "name",
    //                 location: "body",
    //             }],
    //         });
    //     }

    //     await sex.update({ 
    //         isActive: false
    //     });

    //     res.status(200).json({
    //         message: "Record Disabled!", 
    //         sex: sex 
    //     });

    // } catch (error) {

    //     res.status(500).json({ 
    //         error: error.message 
    //     });

    // }
};

exports.Enable = async (req, res) => {

    // const { 
    //     id 
    // } = req.params;
  
    // try {

    //     const sex = await Sex.findByPk(id);

    //     if (!sex) {
    //         return res.status(500).json({
    //             errors: [{
    //                 type: "field",
    //                 value: id,
    //                 msg: "Record not found!",
    //                 path: "name",
    //                 location: "body",
    //             }],
    //         });
    //     }

    //     await sex.update({ 
    //         isActive: true 
    //     });

    //     res.status(200).json({
    //         message: "Record Enabled!.", 
    //         sex: sex
    //     });
    // } catch (error) {

    //     res.status(500).json({ 
    //         error: error.message 
    //     });

    // }
};

exports.GeneratePDF = async (req, res) => {
    const { 
        id 
    } = req.params;
    let browser;
    try {
        const rows  = await Application.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    attributes: [
                        'firstname', 
                        'middlename', 
                        'lastname',
                        'suffix',
                        'birthdate',
                        'birthplace',
                        'weight',
                        'height',
                        'streetAddress',
                        'email',
                        'contactNo'
                    ],
                    include: [
                        {
                            model: Sex,
                            as: 'sex',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: CivilStatus,
                            as: 'civilStatus',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: BloodType,
                            as: 'bloodType',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Region,
                            as: 'region',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Province,
                            as: 'province',
                            attributes: [
                                'name'
                            ]    
                        },
                        {
                            model: Town,
                            as: 'town',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: Barangay,
                            as: 'barangay',
                            attributes: [
                                'name'
                            ]
                        },
                        {
                            model: ProfileEducation,
                            as: 'educations',
                            attributes: [
                                'startDate', 'endDate', 'rating', 'graduated'
                            ],
                            where: {
                                isActive: true
                            },
                            include: [
                                {
                                    model: SchoolLevel,
                                    as: 'level',
                                    attributes: [
                                        "name"
                                    ]
                                },
                                {
                                    model: School,
                                    as: 'school',
                                    attributes: [
                                        'name', 'type', 'website', 'contactNo'
                                    ]
                                },
                                {
                                    model: Course,
                                    as: 'course',
                                    attributes: [
                                        'name'
                                    ]
                                }
                            ]
                        },
                        {
                            model: ProfileTraining,
                            as: 'trainings',
                            attributes: [
                                'title', 'startDate', 'endDate', 'hour', 'typeId', 'conductedBy'
                            ],
                            where: {
                                isActive: true
                            },
                            include: [
                                {
                                    model: TrainingType,
                                    as: 'trainingType',
                                    attributes: [
                                        'name'
                                    ]
                                }
                            ]
                        },
                        {
                            model: ProfileExperience,
                            as: 'experiences',
                            attributes: [
                                'position', 'jobDescription', 'startDate', 'endDate'
                            ],
                            where: {
                                isActive: true
                            },
                        },
                        {
                            model: ProfileDocument,
                            as: 'documents',
                            attributes: [
                                'filename', 'file'
                            ]
                        }
                    ]
                }
            ]
        });

        const templatePath = path.join(__dirname, '../templates/reports/Application.pug');

        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const getFullName = (profile) => {
            if (!profile) return '';

            const first = profile.firstname || '';
            const middle = profile.middlename
                ? ` ${profile.middlename.charAt(0).toUpperCase()}.`
                : '';
            const last = profile.lastname || '';
            const suffix = profile.suffix ? ` ${profile.suffix}` : '';

            return `${first}${middle} ${last}${suffix}`.replace(/\s+/g, ' ').trim();
        };
        const name = getFullName(rows?.profile);
        const sex = rows?.profile?.sex?.name || '';
        const maritalStatus = rows?.profile?.civilStatus?.name || '';
        const birthdate = rows?.profile?.birthdate
            ? moment(rows.profile.birthdate).format('MMMM DD, YYYY')
            : '';
        const birthplace = rows?.profile?.birthplace || '';
        const formatAddress = (profile) => {
            if (!profile) return '';

            const parts = [
                profile.streetAddress,
                profile.barangay?.name,
                profile.town?.name,
                profile.province?.name,
                profile.region?.name
            ];

            return parts
                .filter(Boolean)      // remove null / undefined / empty
                .join(', ');
        };
        const address = formatAddress(rows.profile);
        const bloodType = rows?.profile?.bloodType?.name || '';
        const h = rows?.profile?.height
            ? `${rows.profile.height} cm`
            : '';
        const w = rows?.profile?.weight
            ? `${rows.profile.weight} kg`
            : '';
        const email = rows?.profile?.email || '';
        const contactNo = rows?.profile?.contactNo || '';
        const educations = rows?.profile?.educations?.map(edu => ({
            level: edu?.level?.name || '',
            school: edu?.school?.name || '',
            schoolType: edu?.school?.type || '',
            course: edu?.course?.name || '',
            startDate: edu?.startDate
                ? moment(edu.startDate).format('MMMM YYYY')
                : '',
            endDate: edu?.endDate
                ? moment(edu.endDate).format('MMMM YYYY')
                : '',
            rating: edu?.rating || '',
            graduated: edu?.graduated ? 'Yes' : 'No'
        })) || [];
        const trainings = rows?.profile?.trainings?.map(t => ({
            title: t?.title || '',
            type: t?.trainingType?.name || null,
            conductedBy: t?.conductedBy || '',
            startDate: t?.startDate
                ? moment(t.startDate).format('MMMM YYYY')
                : '',
            endDate: t?.endDate
                ? moment(t.endDate).format('MMMM YYYY')
                : '',
            hours: t?.hour || ''
        })) || [];
        const experiences = rows?.profile?.experiences?.map(e => ({
            position: e?.position || '',
            jobDescription: e?.jobDescription || '',
            startDate: e?.startDate
                ? moment(e.startDate).format('MMMM YYYY')
                : '',
            endDate: e?.endDate
                ? moment(e.endDate).format('MMMM YYYY')
                : ''
        })) || [];
        const documents = rows?.profile?.documents?.map(d => ({
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
            height: h,
            weight: w,
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