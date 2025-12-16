const { Op, Sequelize, literal } = require("sequelize");
const { 
    EmploymentInformation, 
    Profile, 
    Position, 
    EmploymentStatus,
    Application,
    ProfileContactInformation,
    Vacancy,
    ProfilePhoto,
    EmploymentSchedule,
    EmploymentHistory,
    AppointmentStatus,
    EmploymentPhoto,
    ProfileEducation,
    ProfileTraining,
    ProfileExperience,
    ProfileDependent,
    Salary,
    Rate,
    ProfileLeave,
    LeaveType,
    Leave,
    TimeCard,
    Holiday,
    ProfileOvertime,
    Overtime,
    TimeLog,
    SalaryClass, 
    SalaryGrade,
    LeaveRequest,
    Signatory,
    User,
    Company,
    Department
} = require('../models');

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

    try {

        const { count, rows } = await EmploymentInformation.findAndCountAll({
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    attributes: [
                        'firstname', 'middlename', 'lastname', 'suffix'
                    ]
                },
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
                },
                {
                    model: EmploymentStatus,
                    as: 'employmentStatus',
                    attributes: [
                        'name'
                    ]
                },
                {
                    model: AppointmentStatus,
                    as: 'appointmentStatus',
                    attributes: [
                        'name'
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    { '$profile.isEmployee$': true },
                    Filter
                    ? {
                        [Op.or]: [
                            { '$position.name$': { [Op.like]: `%${Filter}%` } },
                            { '$profile.firstname$': { [Op.like]: `%${Filter}%` } },
                            { '$profile.middlename$': { [Op.like]: `%${Filter}%` } },
                            { '$profile.lastname$': { [Op.like]: `%${Filter}%` } }
                        ]
                        }
                    : {}
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

const GetEmployment = async (id) => {
    
    return await EmploymentInformation.findOne({
        include: [
            {
                model: Profile,
                as: 'profile',
                attributes: [
                    'firstname', 'middlename', 'lastname', 'suffix'
                ]
            },
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
            },
            {
                model: EmploymentStatus,
                as: 'employmentStatus',
                attributes: [
                    'name'
                ]
            },
            {
                model: AppointmentStatus,
                as: 'appointmentStatus',
                attributes: [
                    'name'
                ]
            }
        ],
        where: {
            id
        }
    });
};

exports.GetEmployeeProfile = async (req, res) => {

    const { 
        id 
    } = req.params;

    try {

        const rows = await Profile.findOne({
            where: {
                id
            }
        })

        res.json({
            data: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GetEmployeeApplication = async (req, res) => {

    const { 
        id 
    } = req.params;

    try {

        const rows = await Application.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Vacancy,
                    as: 'vacancy',
                    include: [
                        {
                            model: Salary,
                            as: 'salary',
                            attributes: [
                                'positionId'
                            ]
                        }
                    ]
                }
            ]
        })

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
        profileId,
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
        employeeNo,
        dateHired,
        salaryId,
        rateId,
        companyId,
        departmentId,
        shiftId,
        employmentId,
        appointmentId,
        tin,
        sssNo,
        philhealthNo,
        pagibigNo,
        taxCodeId
    } = req.body;

    const file = req.file;

    const t = await Profile.sequelize.transaction();

    try {

        const year = new Date().getFullYear().toString();
        const latest = await EmploymentInformation.findOne({
            where: { employeeNo: { [Op.like]: `${year}%` } },
            order: [['employeeNo', 'DESC']],
            transaction: t
        });
        const newEmployeeNo = `${year}${String(
            latest ? parseInt(latest.employeeNo.slice(4)) + 1 : 1
        ).padStart(5, '0')}`;

        let employee = null;
        if (!profileId) {
            const profile = await Profile.create({
                firstname,
                middlename,
                lastname,
                suffix,
                sexId,
                civilStatusId: maritalId,
                birthdate,
                birthplace,
                weight,
                height,
                bloodTypeId,
                regionId,
                provinceId,
                townId,
                barangayId,
                streetAddress,
                email,
                contactNo,
                isEmployee: true
            }, { transaction: t });
            employee = profile;
        } else {
            const profile = await Profile.findByPk(profileId);
            await profile.update({
                firstname,
                middlename,
                lastname,
                suffix,
                sexId,
                civilStatusId: maritalId,
                birthdate,
                birthplace,
                weight,
                height,
                bloodTypeId,
                regionId,
                provinceId,
                townId,
                barangayId,
                streetAddress,
                email,
                contactNo,
                isEmployee: true
            }, { transaction: t });
            employee = profile;
        }
        const exist = await EmploymentInformation.findOne({
            where: {
                employeeNo
            }, transaction: t
        });
        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: employeeNo,
                    msg: "Employee Number already exists!",
                    path: "employeeNo",
                    location: "body",
                }],
            });
        }
        
        const employmentInfo = await EmploymentInformation.create({
            profileId: employee.id,
            employeeNo: (employeeNo?.trim() ? employeeNo : newEmployeeNo),
            dateHired,
            tin,
            sssNo,
            philhealthNo,
            pagibigNo,
            taxCodeId,
            companyId,
            departmentId,
            salaryId,
            rateId,
            employmentId,
            appointmentId,
            shiftId
        }, { transaction: t });
        await EmploymentHistory.create({
            profileId: employee.id,
            salaryId,
            rateId,
            employmentId,
            appointmentId,
            dateStart: dateHired
        }, { transaction: t });
        await Application.update({
            isActive: false
        }, {
            where: {
                profileId: employee.id,
                status: 'Hired'
            },
            transaction: t
        });
        await Salary.update({
            status: 'Filled'
        }, {
            where: {
                id: salaryId
            },
            transaction: t
        });
        if (file) {
            const filename = file.originalname;
            const ext = path.extname(file.originalname).toLowerCase();
            const uploadPath = path.join(__dirname, '../public/photos', filename);

            let sharpPipeline = sharp(file.buffer).resize({ width: 800 });

            if (ext === '.png') {
                sharpPipeline = sharpPipeline.png({ quality: 80 });
            } else {
                sharpPipeline = sharpPipeline
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: 80 });
            }

            await sharpPipeline.toFile(uploadPath);

            await ProfilePhoto.create({
                profileId: employee.id,
                filename: filename,
                file: `/photos/${filename}`
            }, { transaction: t });
        }

        await t.commit();

        const data = await GetEmployment(employmentInfo.id);

        res.status(201).json({
            message: "Record Saved!",
            data
        });

    } catch (error) {

        await t.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

const GetEmployeeRecord = async (id) => {
    return await Profile.findOne({
        where: {
            id
        }
    })
};

exports.UpdateProfile = async (req, res) => {

    const { 
        id 
    } = req.params;

    const { 
        firstname,
        middlename,
        lastname,
        suffix,
        sexId,
        civilStatusId,
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
        streetAddress
    } = req.body;

    const t = await Profile.sequelize.transaction();

    try {

        const profile = await Profile.findByPk(id);
        
        if (!profile) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: firstname,
                    msg: "Record not found!",
                    path: "firstname",
                    location: "body",
                }],
            });
        }

        await profile.update({ 
            firstname,
            middlename,
            lastname,
            suffix,
            sexId,
            civilStatusId,
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
            streetAddress
        }, { transaction: t });

        await t.commit();

        const data = await GetEmployeeRecord(profile.id);

        res.status(201).json({
            message: "Record Modified!",
            data
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.GetEmployeeEmployment = async (req, res) => {

    const { 
        id 
    } = req.params;
    
    try {

        const rows = await EmploymentInformation.findOne({
            where: {
                id
            },
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
                        }
                    ]
                },
                {
                    model: Rate,
                    as: 'rate',
                    attributes: [
                        'monthlyCompensation'
                    ]
                }
            ]
        })

        res.json({
            data: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

const GetEmploymentRecord = async (id) => {
    return await EmploymentInformation.findOne({
        where: {
            id
        },
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
                    }
                ]
            },
            {
                model: Rate,
                as: 'rate',
                attributes: [
                    'monthlyCompensation'
                ]
            }
        ]
    })
};

exports.UpdateEmployment = async (req, res) => {

    const { 
        id 
    } = req.params;

    const { 
        dateHired,
        tin,
        sssNo,
        philhealthNo,
        pagibigNo,
        taxCodeId,
        shiftId,
        companyId,
        departmentId,
        employmentId,
        appointmentId
    } = req.body;

    const t = await EmploymentInformation.sequelize.transaction();

    try {

        const employment = await EmploymentInformation.findByPk(id);
        
        if (!employment) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: req.body,
                    msg: "Record not found!",
                    path: "dateHired",
                    location: "body",
                }],
            });
        }

        await employment.update({ 
            dateHired,
            tin,
            sssNo,
            philhealthNo,
            pagibigNo,
            taxCodeId,
            shiftId,
            companyId,
            departmentId,
            employmentId,
            appointmentId
        }, { transaction: t });

        await t.commit();

        const data = await GetEmploymentRecord(employment.id);

        res.status(201).json({
            message: "Record Modified!",
            data
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.GetEmployeeEducation = async (req, res) => {

    const { 
        id 
    } = req.params;
    
    try {

        const rows = await ProfileEducation.findAll({
            where: {
                profileId: id,
                isActive: true
            }
        })

        res.json({
            data: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

const GetEducationRecord = async (id) => {
    return await ProfileEducation.findAll({
        where: {
            profileId: id,
            isActive: true
        }
    })
};

exports.CreateEducation = async (req, res) => {

    const { 
        id 
    } = req.params;

    const { 
        educations
    } = req.body;

    const educ = Array.isArray(educations) ? educations : [];

    const t = await ProfileEducation.sequelize.transaction();

    try {
        const existingRecords = await ProfileEducation.findAll({
            where: { profileId: id, isActive: true },
            transaction: t
        });
        const existingIds = existingRecords.map(e => e.id);
        const sentIds = educ.filter(e => e.id).map(e => e.id);

        for (const edu of educ) {
            if (edu.id && existingIds.includes(edu.id)) {
                // UPDATE if exists
                await ProfileEducation.update({
                    levelId: edu.levelId,
                    schoolId: edu.schoolId,
                    courseId: edu.courseId,
                    rating: edu.rating,
                    startDate: edu.startDate,
                    endDate: edu.endDate,
                    graduated: edu.graduated
                }, {
                    where: { id: edu.id },
                    transaction: t
                });
            } else {
                // INSERT new record
                await ProfileEducation.create({
                    profileId: id,
                    levelId: edu.levelId,
                    schoolId: edu.schoolId,
                    courseId: edu.courseId,
                    rating: edu.rating,
                    startDate: edu.startDate,
                    endDate: edu.endDate,
                    graduated: edu.graduated,
                    isActive: true
                }, { transaction: t });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await ProfileEducation.update(
                { isActive: false },
                { where: { id: toDeactivate }, transaction: t }
            );
        }

        await t.commit();

        const data = await GetEducationRecord(id);

        res.status(201).json({
            message: "Record Saved!",
            data
        });

    } catch (error) {
        await t.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.GetEmployeeTraining = async (req, res) => {

    const { 
        id 
    } = req.params;
    
    try {

        const rows = await ProfileTraining.findAll({
            where: {
                profileId: id,
                isActive: true
            }
        })

        res.json({
            data: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

const GetTrainingRecord = async (id) => {
    return await ProfileTraining.findAll({
        where: {
            profileId: id,
            isActive: true
        }
    })
};

exports.CreateTraining = async (req, res) => {

    const { 
        id 
    } = req.params;

    const { 
        trainings
    } = req.body;

    const training = Array.isArray(trainings) ? trainings : [];

    const t = await ProfileTraining.sequelize.transaction();

    try {
        const existingRecords = await ProfileTraining.findAll({
            where: { 
                profileId: id, 
                isActive: true 
            },
            transaction: t
        });
        const existingIds = existingRecords.map(e => e.id);
        const sentIds = training.filter(e => e.id).map(e => e.id);

        for (const tr of training) {
            if (tr.id && existingIds.includes(tr.id)) {
                // UPDATE if exists
                await ProfileTraining.update({
                    profileId: id,
                    title: tr.title,
                    startDate: tr.startDate,
                    endDate: tr.endDate,
                    hour: tr.hour,
                    typeId: tr.typeId,
                    conductedBy: tr.conductedBy
                }, {
                    where: { id: tr.id },
                    transaction: t
                });
            } else {
                // INSERT new record
                await ProfileTraining.create({
                    profileId: id,
                    title: tr.title,
                    startDate: tr.startDate,
                    endDate: tr.endDate,
                    hour: tr.hour,
                    typeId: tr.typeId,
                    conductedBy: tr.conductedBy
                }, { transaction: t });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await ProfileTraining.update(
                { 
                    isActive: false 
                },
                { 
                    where: { 
                        id: toDeactivate }, transaction: t 
                    }
            );
        }

        await t.commit();

        const data = await GetTrainingRecord(id);

        res.status(201).json({
            message: "Record Saved!",
            data
        });

    } catch (error) {
        await t.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.GetEmployeeExperience = async (req, res) => {

    const { 
        id 
    } = req.params;
    
    try {

        const rows = await ProfileExperience.findAll({
            where: {
                profileId: id,
                isActive: true
            }
        })

        res.json({
            data: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

const GetExperienceRecord = async (id) => {
    return await ProfileExperience.findAll({
        where: {
            profileId: id,
            isActive: true
        }
    })
};

exports.CreateExperience = async (req, res) => {

    const { 
        id 
    } = req.params;

    const { 
        experiences
    } = req.body;

    const experience = Array.isArray(experiences) ? experiences : [];

    const t = await ProfileExperience.sequelize.transaction();

    try {
        const existingRecords = await ProfileExperience.findAll({
            where: { 
                profileId: id, 
                isActive: true 
            },
            transaction: t
        });
        const existingIds = existingRecords.map(e => e.id);
        const sentIds = experience.filter(e => e.id).map(e => e.id);

        for (const exp of experience) {
            if (exp.id && existingIds.includes(exp.id)) {
                // UPDATE if exists
                await ProfileExperience.update({
                    profileId: id,
                    position: exp.position,
                    startDate: exp.startDate,
                    endDate: exp.endDate,
                    jobDescription: exp.description
                }, {
                    where: { id: exp.id },
                    transaction: t
                });
            } else {
                // INSERT new record
                await ProfileExperience.create({
                    profileId: id,
                    position: exp.position,
                    startDate: exp.startDate,
                    endDate: exp.endDate,
                    jobDescription: exp.description
                }, { transaction: t });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await ProfileExperience.update(
                { 
                    isActive: false 
                },
                { 
                    where: { 
                        id: toDeactivate }, transaction: t 
                    }
            );
        }

        await t.commit();

        const data = await GetExperienceRecord(id);

        res.status(201).json({
            message: "Record Saved!",
            data
        });

    } catch (error) {
        await t.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.GetEmployeeDependent = async (req, res) => {

    const { 
        id 
    } = req.params;
    
    try {

        const rows = await ProfileDependent.findAll({
            where: {
                profileId: id,
                isActive: true
            }
        })

        res.json({
            data: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

const GetDependentRecord = async (id) => {
    return await ProfileDependent.findAll({
        where: {
            profileId: id,
            isActive: true
        }
    })
};

exports.CreateDependent = async (req, res) => {

    const { 
        id 
    } = req.params;

    const { 
        dependents
    } = req.body;

    const dependent = Array.isArray(dependents) ? dependents : [];

    const t = await ProfileDependent.sequelize.transaction();

    try {
        const existingRecords = await ProfileDependent.findAll({
            where: { 
                profileId: id, 
                isActive: true 
            },
            transaction: t
        });
        const existingIds = existingRecords.map(e => e.id);
        const sentIds = dependent.filter(e => e.id).map(e => e.id);

        for (const dep of dependent) {
            if (dep.id && existingIds.includes(dep.id)) {
                // UPDATE if exists
                await ProfileDependent.update({
                    profileId: id,
                    relationshipId: dep.relationshipId,
                    firstname: dep.firstname,
                    middlename: dep.middlename,
                    lastname: dep.lastname,
                    suffix: dep.suffix,
                    birthdate: dep.birthdate
                }, {
                    where: { id: dep.id },
                    transaction: t
                });
            } else {
                // INSERT new record
                await ProfileDependent.create({
                    profileId: id,
                    profileId: id,
                    relationshipId: dep.relationshipId,
                    firstname: dep.firstname,
                    middlename: dep.middlename,
                    lastname: dep.lastname,
                    suffix: dep.suffix,
                    birthdate: dep.birthdate
                }, { transaction: t });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await ProfileDependent.update(
                { 
                    isActive: false 
                },
                { 
                    where: { 
                        id: toDeactivate }, transaction: t 
                    }
            );
        }

        await t.commit();

        const data = await GetDependentRecord(id);

        res.status(201).json({
            message: "Record Saved!",
            data
        });

    } catch (error) {
        await t.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.GetEmployeeService = async (req, res) => {

    const { 
        id 
    } = req.params;
    
    try {

        const rows = await EmploymentHistory.findAll({
            where: {
                profileId: id
            },
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
                        }
                    ]
                },
                {
                    model: Rate,
                    as: 'rate',
                    where: {
                        id: { [Op.col]: "EmploymentHistory.rateId" }
                    },
                    attributes: [
                        'monthlyCompensation'
                    ]
                },
                {
                    model: EmploymentStatus,
                    as: 'employmentStatus',
                    attributes: [
                        'name'
                    ]
                },
                {
                    model: AppointmentStatus,
                    as: 'appointmentStatus',
                    attributes: [
                        'name'
                    ]
                }
            ],
            order: [['dateStart', 'DESC']]
        })

        res.json({
            data: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

const GetServiceRecord = async (id) => {
    return await EmploymentHistory.findAll({
        where: {
            profileId: id,
            isActive: true
        }
    })
};

exports.CreateService = async (req, res) => {

    const { 
        id 
    } = req.params;

    const { 
        vacancyId,
        appointmentId,
        employmentId,
        dateHired
    } = req.body;

    const t = await EmploymentHistory.sequelize.transaction();

    try {

        const salaries = await Vacancy.findOne({
            where: { 
                id: vacancyId 
            },
            include: [
                {
                    model: Salary,
                    as: 'salary',
                    attributes: [
                        'id'
                    ],
                    include: [
                        {
                            model: Rate,
                            as: 'rates',
                            required: false,
                            where: {
                                stepId: { [Op.col]: "Vacancy.stepId" }
                            }
                        },
                        {
                            model: Position,
                            as: 'positions',
                            attributes: [
                                'name'
                            ]
                        },
                    ]
                }
            ],
            transaction: t
        });

        const salaryId = salaries?.salary?.id ?? null;
        const rateId = salaries?.salary?.rates?.length ? salaries.salary.rates[0].id : null;

        await EmploymentInformation.update({
            dateHired,
            salaryId,
            rateId,
            employmentId,
            appointmentId
        }, {
            where: { 
                profileId: id 
            },
            transaction: t
        });

        // update vacancy to filled
        await Salary.update({
            status: 'Filled'
        }, {
            where: {
                id: salaryId
            },
            transaction: t
        });

        await Vacancy.update({
            status: 'Filled'
        }, {
            where: {
                id: vacancyId
            },
            transaction: t
        });

        const previousHistory = await EmploymentHistory.findOne({
            where: {
                profileId: id
            },
            order: [['dateStart', 'DESC']],  // get last employment history
            transaction: t
        });

        // Update dateEnd based on found previous record
        if (previousHistory) {
            await previousHistory.update({
                dateEnd: moment(dateHired).subtract(1, 'day').format('YYYY-MM-DD')
            }, { transaction: t });
        }

        await EmploymentHistory.create({
            profileId: id,
            salaryId,
            rateId,
            employmentId,
            appointmentId,
            dateStart: dateHired
        }, { transaction: t });

        await t.commit();

        const data = await GetServiceRecord(id);

        res.status(201).json({
            message: "Record Saved!",
            data
        });

    } catch (error) {
        await t.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.GenerateServiceRecordPDF = async (req, res) => {
    const { 
        id
    } = req.params;
    let browser;
    try {

        const services = await EmploymentHistory.findAll({
            where: {
                profileId: id
            },
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
                        }
                    ]
                },
                {
                    model: Rate,
                    as: 'rate',
                    where: {
                        id: { [Op.col]: "EmploymentHistory.rateId" }
                    },
                    attributes: [
                        'monthlyCompensation'
                    ]
                },
                {
                    model: EmploymentStatus,
                    as: 'employmentStatus',
                    attributes: [
                        'name'
                    ]
                },
                {
                    model: AppointmentStatus,
                    as: 'appointmentStatus',
                    attributes: [
                        'name'
                    ]
                }
            ],
            order: [['dateStart', 'DESC']]
        })

        const templatePath = path.join(__dirname, '../templates/reports/ServiceRecord.pug');

        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const html = pug.renderFile(templatePath, { 
            seal, 
            services,
            moment
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
            landscape: true, 
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

exports.GetEmployeePhoto = async (req, res) => {

    const { 
        id 
    } = req.params;
    
    try {

        const rows = await ProfilePhoto.findOne({
            where: { profileId: id }
        });

        res.json({ data: rows });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.CreatePhoto = async (req, res) => {
    const file = req.file;
    const t = await ProfilePhoto.sequelize.transaction();

    try {
        if (!file) {
            // No file uploaded, rollback and exit early
            await t.rollback();
            return res.status(400).json({ error: "No file uploaded" });
        }

        const timestamp = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${path.basename(file.originalname, ext)}-${timestamp}${ext}`;
        const uploadPath = path.join(__dirname, '../public/photos', filename);

        // Resize and convert
        let sharpPipeline = sharp(file.buffer).resize({ width: 800 });
        if (ext === '.png') {
            sharpPipeline = sharpPipeline.png({ quality: 80 });
        } else {
            sharpPipeline = sharpPipeline.flatten({ background: { r: 255, g: 255, b: 255 } }).jpeg({ quality: 80 });
        }

        await sharpPipeline.toFile(uploadPath);

        // Remove old photo
        await ProfilePhoto.destroy({
            where: { profileId: req.params.id },
            transaction: t
        });

        // Create new record
        const newPhoto = await ProfilePhoto.create({
            profileId: req.params.id,
            filename,
            file: `/photos/${filename}`
        }, { transaction: t });

        await t.commit();

        return res.status(201).json({
            message: "Photo uploaded successfully!",
            data: newPhoto
        });

    } catch (error) {
        // rollback only if transaction is active
        if (!t.finished) {
            await t.rollback();
        }
        console.error(error.stack);
        return res.status(500).json({ error: error.message });
    }
};


exports.GetEmployeeLeaveCredit = async (req, res) => {

    const { 
        id 
    } = req.params;
    
    try {

        const rows = await ProfileLeave.findAll({
            where: { profileId: id },
            include: [
                {
                    model: LeaveType,
                    as: 'leaveType',
                    attributes: ['id', 'name', 'credit']
                },
                {
                    model: Leave,
                    as: 'leaves',
                    attributes: ['dateStart', 'dateEnd', 'status'],
                    where: { status: 'Approved' },
                    required: false // allows leave types even if no approved leaves yet
                }
            ]
        });

        // Compute credit, used, and balance
        const result = rows.map(item => {
            const credit = item.credit || 0;

            // compute total approved leave days
            const used = (item.leaves || []).reduce((sum, leave) => {
                const start = moment(leave.dateStart);
                const end = moment(leave.dateEnd);

                // +1 because leave from Oct 01 to Oct 01 = 1 day
                const days = end.diff(start, 'days') + 1;

                return sum + days;
            }, 0);

            const balance = credit - used;

            return {
                id: item.id,
                typeId: item.typeId,
                leaveType: item.leaveType?.name,
                credit: credit,
                used: used,
                balance: balance
            };
        });

        res.json({ data: result });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.CreateLeaveCredit = async (req, res) => {
    
    const {
        id
    } = req.params;

    try {
        
        // get all leave types
        const leaveTypes = await LeaveType.findAll();

        // insert leave credits for each type
        for (const type of leaveTypes) {
            await ProfileLeave.create({
                profileId: id,
                typeId: type.id,
                credit: type.credit
            });
        }

        return res.status(201).json({
            message: "record created!"
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.GetEmployeeLeaveApplication = async (req, res) => {

    const { 
        id 
    } = req.params;

    const month = req.query.month;
    const year = req.query.year;

    const startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
    
    try {

        const rows = await Leave.findAll({
            where: {
                [Op.and]: [
                    { dateStart: { [Op.lte]: endDate } }, // leave starts before or on endOfMonth
                    { dateEnd: { [Op.gte]: startDate } }  // leave ends after or on startOfMonth
                ]
            },
            include: [
                {
                    model: ProfileLeave,
                    as: 'profileLeave',
                    where: { profileId: id },
                    include: [
                        {
                            model: LeaveType,
                            as: 'leaveType',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // ✅ MAP TO CLEAN OUTPUT
        const result = rows.map(item => {
            const start = new Date(item.dateStart);
            const end = new Date(item.dateEnd);
            const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1; // inclusive count

            return {
                id: item.id,
                leaveTypeId: item.profileLeave.leaveType.id,
                leaveType: item.profileLeave.leaveType.name,
                startDate: item.dateStart,
                endDate: item.dateEnd,
                days: days,
                status: item.status,
                createdAt: item.createdAt
            };
        });

        res.json({
            data: result
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GenerateLeavePDF = async (req, res) => {
    const { 
        id
    } = req.params;
    let browser;
    try {

        // 1️⃣ Get all leave types
        const leaveTypes = await LeaveType.findAll({
            attributes: ['id', 'name']
        });

        // 2️⃣ Get leave record with selected leave types
        const rows = await Leave.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: ProfileLeave,
                    as: 'profileLeave',
                    attributes: ['typeId'],
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: [
                                'id',
                                'firstname',
                                'middlename',
                                'lastname',
                                'suffix',
                                'contactNo'
                            ],
                            include: [
                                {
                                    model: EmploymentInformation,
                                    as: 'employment',
                                    attributes: ['id'],
                                    include: [
                                        {
                                            model: Company,
                                            as: 'company',
                                            attributes: [
                                                'name'
                                            ]
                                        },
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
                                        },
                                        {
                                            model: Department,
                                            as: 'department',
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
        });

        // ✅ SAFELY normalize profileLeave
        const profileLeaves = rows && rows.profileLeave
            ? Array.isArray(rows.profileLeave)
                ? rows.profileLeave
                : [rows.profileLeave]
            : [];

        const activeLeaveTypeIds = profileLeaves.map(pl => pl.typeId);

        const formattedLeaveTypes = leaveTypes.map(lt => ({
            ...lt.toJSON(),
            active: activeLeaveTypeIds.includes(lt.id)
        }));

        // Extract profile and employment details
        const profile = rows?.profileLeave?.profile;
        const employment = profile?.employment;
        const company = employment?.company?.name || '';
        const departmentPosition = `${employment?.department?.name || ''} - ${employment?.salary?.positions?.name || ''}`;
        const nameParts = [
            profile?.firstname || '',
            profile?.middlename ? `${profile.middlename.charAt(0)}.` : '',
            profile?.lastname || '',
            profile?.suffix ? ` ${profile.suffix}` : ''
        ];
        const name = nameParts.join(' ').replace(/\s+/g, ' ').trim();
        const contactNo = profile?.contactNo || '';
        const dateFiled = moment(rows?.createdAt).format('MMMM DD, YYYY');
        const reason = rows?.reason || '';

        // extract leave start and end dates and format and compute total days
        const leaveStart = moment(rows?.dateStart).format('MMMM DD, YYYY');
        const leaveEnd = moment(rows?.dateEnd).format('MMMM DD, YYYY');
        const totalDays = moment(rows?.dateEnd).diff(moment(rows?.dateStart), 'days') + 1;

        // get all leave types with corresponding balances
        const leaveBalance = await ProfileLeave.findAll({
            where: { 
                profileId: profile.id 
            },
            include: [
                {
                    model: LeaveType,
                    as: 'leaveType',
                    attributes: ['id', 'name', 'credit']
                },
                {
                    model: Leave,
                    as: 'leaves',
                    attributes: ['dateStart', 'dateEnd', 'status'],
                    where: { status: 'Approved' },
                    required: false // allows leave types even if no approved leaves yet
                }
            ]
        });

       const balance = leaveBalance.map(item => {
            const credit = item.leaveType?.credit || 0;

            const used = (item.leaves || []).reduce((sum, leave) => {
                const start = moment(leave.dateStart);
                const end = moment(leave.dateEnd);
                return sum + (end.diff(start, 'days') + 1);
            }, 0);

            return {
                leaveType: item.leaveType?.name,
                credit,
                used,
                balance: credit - used
            };
        });

        // get leave requests
        const leaveRequests = await LeaveRequest.findAll({
            where: { leaveId: id },
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
            ],
            order: [
                [{ model: Signatory, as: 'signatory' }, 'order', 'ASC']
            ]
        });

        const signatories =
            leaveRequests?.map((req) => {
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
            balance,
            leaveStart,
            leaveEnd,
            totalDays,
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
        res.send(buffer)

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

exports.GetEmployeeDTR = async (req, res) => {

    const { 
        id
    } = req.params;
    
    try {

        const month = parseInt(req.query.month); // e.g., 11 for November
        const year = parseInt(req.query.year);   // e.g., 2025

        // Build month start and end
        const startDateMoment = moment(`${year}-${month}-01`, "YYYY-MM-DD").startOf("month");
        const endDateMoment = moment(`${year}-${month}-01`, "YYYY-MM-DD").endOf("month");

        // Format for DB query
        const startDate = startDateMoment.format("YYYY-MM-DD");
        const endDate = endDateMoment.format("YYYY-MM-DD");

        // ✅ 1. Fetch Time Logs
        const rows = await TimeLog.findAll({
            where: {
                profileId: id,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [["date", "ASC"]]
        });

        // ✅ 2. Group Time Logs by Day
        const grouped = rows.reduce((acc, row) => {
            const date = row.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(row.time);
            return acc;
        }, {});

        // ✅ 3. Fetch Approved Leaves
        const leaves = await Leave.findAll({
            where: {
                status: 'Approved',
                dateStart: { [Op.lte]: endDate },
                dateEnd: { [Op.gte]: startDate }
            },
            include: [
                {
                    model: ProfileLeave,
                    as: "profileLeave",
                    where: { profileId: id },
                    include: [
                        { 
                            model: LeaveType, 
                            as: "leaveType" 
                        }
                    ]
                }
            ]
        });

        // ✅ 4. Fetch Holidays within Range
        const holidays = await Holiday.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // ✅ 5. Fetch Overtimes within Range for Profile
        const overtimes = await ProfileOvertime.findAll({
            where: { profileId: id },
            include: [
                {
                    model: Overtime,
                    as: "overtime",
                    where: {
                        date: { [Op.between]: [startDate, endDate] },
                        status: 'Approved'
                    }
                }
            ]
        });

        // ✅ 6. Build lookup maps for leaves, holidays, and overtimes
        const leaveMap = {};
        leaves.forEach(leave => {
            const leaveTypeName = leave.profileLeave.leaveType.name;
            let day = moment(leave.dateStart);
            const end = moment(leave.dateEnd);
            while (day.isSameOrBefore(end)) {
                leaveMap[day.format("YYYY-MM-DD")] = leaveTypeName;
                day.add(1, "day");
            }
        });

        const holidayMap = {};
        holidays.forEach(holiday => {
            holidayMap[moment(holiday.date).format("YYYY-MM-DD")] = holiday.name;
        });

        const overtimeMap = {};
        overtimes.forEach(po => {
            const ot = po.overtime;
            if (!overtimeMap[ot.date]) overtimeMap[ot.date] = [];
            overtimeMap[ot.date].push({
                start: moment(ot.timeStart, "HH:mm:ss").format("h:mm A"),
                end: moment(ot.timeEnd, "HH:mm:ss").format("h:mm A"),
                description: ot.description,
                status: ot.status
            });
        });

        // ✅ 7. Generate Daily Records
        const result = [];
        let day = moment(startDate);
        const endDay = moment(endDate);

        while (day.isSameOrBefore(endDay)) {
            const formatted = day.format("YYYY-MM-DD");

            // Time logs
            let times = grouped[formatted] || [];
            times = times.map(t => t ? moment(t, ["HH:mm", "HH:mm:ss"]).format("h:mm A") : "");
            if (times.length < 4) times = [...times, ...Array(4 - times.length).fill("")];
            if (times.length > 4) times = times.slice(0, 4);

            // Leave & Holiday
            const leaveTypeName = leaveMap[formatted] || "";
            const holidayName = holidayMap[formatted] || "";

            const hasOvertime = overtimeMap[formatted] && overtimeMap[formatted].length > 0;
            const overtimeDisplay = hasOvertime ? "Overtime" : "";

            result.push({
                profileId: id,
                date: formatted,
                times,
                leaveType: leaveTypeName,
                holiday: holidayName,
                overtimes: overtimeDisplay
            });

            day.add(1, "day");
        }

        res.json({
            data: result
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GeneratePDF = async (req, res) => {
    const { 
        id,
        month,
        year
    } = req.params;
    let browser;
    try {

        const months = parseInt(month); // e.g., 11 for November
        const years = parseInt(year);   // e.g., 2025

        // Build month start and end
        const startDateMoment = moment(`${years}-${months}-01`, "YYYY-MM-DD").startOf("month");
        const endDateMoment = moment(`${years}-${months}-01`, "YYYY-MM-DD").endOf("month");

        // Format for DB query
        const startDate = startDateMoment.format("YYYY-MM-DD");
        const endDate = endDateMoment.format("YYYY-MM-DD");

        // ✅ 1. Fetch Time Logs
        const rows = await TimeLog.findAll({
            where: {
                profileId: id,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [["date", "ASC"]]
        });

        // ✅ 2. Group Time Logs by Day
        const grouped = rows.reduce((acc, row) => {
            const date = row.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(row.time);
            return acc;
        }, {});

        // ✅ 3. Fetch Approved Leaves
        const leaves = await Leave.findAll({
            where: {
                status: 'Approved',
                dateStart: { [Op.lte]: endDate },
                dateEnd: { [Op.gte]: startDate }
            },
            include: [
                {
                    model: ProfileLeave,
                    as: "profileLeave",
                    where: { profileId: id },
                    include: [
                        { 
                            model: LeaveType, 
                            as: "leaveType" 
                        }
                    ]
                }
            ]
        });

        // ✅ 4. Fetch Holidays within Range
        const holidays = await Holiday.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // ✅ 5. Fetch Overtimes within Range for Profile
        const overtimes = await ProfileOvertime.findAll({
            where: { profileId: id },
            include: [
                {
                    model: Overtime,
                    as: "overtime",
                    where: {
                        date: { [Op.between]: [startDate, endDate] },
                        status: 'Approved'
                    }
                }
            ]
        });

        // ✅ 6. Build lookup maps for leaves, holidays, and overtimes
        const leaveMap = {};
        leaves.forEach(leave => {
            const leaveTypeName = leave.profileLeave.leaveType.name;
            let day = moment(leave.dateStart);
            const end = moment(leave.dateEnd);
            while (day.isSameOrBefore(end)) {
                leaveMap[day.format("YYYY-MM-DD")] = leaveTypeName;
                day.add(1, "day");
            }
        });

        const holidayMap = {};
        holidays.forEach(holiday => {
            holidayMap[moment(holiday.date).format("YYYY-MM-DD")] = holiday.name;
        });

        const overtimeMap = {};
        overtimes.forEach(po => {
            const ot = po.overtime;
            if (!overtimeMap[ot.date]) overtimeMap[ot.date] = [];
            overtimeMap[ot.date].push({
                start: moment(ot.timeStart, "HH:mm:ss").format("h:mm A"),
                end: moment(ot.timeEnd, "HH:mm:ss").format("h:mm A"),
                description: ot.description,
                status: ot.status
            });
        });

        // ✅ 7. Generate Daily Records
        const result = [];
        let day = moment(startDate);
        const endDay = moment(endDate);

        while (day.isSameOrBefore(endDay)) {
            const formatted = day.format("YYYY-MM-DD");

            // Time logs
            let times = grouped[formatted] || [];
            times = times.map(t => t ? moment(t, ["HH:mm", "HH:mm:ss"]).format("h:mm A") : "");
            if (times.length < 4) times = [...times, ...Array(4 - times.length).fill("")];
            if (times.length > 4) times = times.slice(0, 4);

            // Leave & Holiday
            const leaveTypeName = leaveMap[formatted] || "";
            const holidayName = holidayMap[formatted] || "";

            const hasOvertime = overtimeMap[formatted] && overtimeMap[formatted].length > 0;
            const overtimeDisplay = hasOvertime ? "Overtime" : "";

            result.push({
                profileId: id,
                date: formatted,
                times,
                leaveType: leaveTypeName,
                holiday: holidayName,
                overtimes: overtimeDisplay
            });

            day.add(1, "day");
        }
console.log('result ', result);
        const monthName = moment(`${year}-${month}-01`, "YYYY-MM-DD").format("MMMM");
        
        const templatePath = path.join(__dirname, '../templates/reports/DTR.pug');

        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const html = pug.renderFile(templatePath, { 
            seal, 
            month: monthName,
            logs: result,
            moment 
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

exports.GetSalaryOption = async (req, res) => {
    try {
        const data = await Salary.findAll({
            include: [
                {
                    model: Position,
                    as: 'positions',
                    attributes: []
                },
                {
                    model: SalaryClass,
                    as: 'class',
                    attributes: []
                },
                {
                    model: SalaryGrade,
                    as: 'grade',
                    attributes: []
                }
            ],

            attributes: [
                ['id', 'id'],
                ['positionId', 'positionId'],
                ['status', 'status'],
                [Sequelize.literal("`positions`.`name`"), 'label'],
                [Sequelize.literal("`class`.`name`"), 'className'],
                [Sequelize.literal("`grade`.`name`"), 'gradeName']
            ]
        });

        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
