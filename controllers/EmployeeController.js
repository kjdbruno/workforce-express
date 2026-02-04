const { Op, Sequelize, literal } = require("sequelize");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');

const pug = require('pug');
const puppeteer = require('puppeteer');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('../models');
const { sequelize } = db;

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {

        const { count, rows } = await db.Employee.findAndCountAll({
            include: [
                {
                    model: db.Employment,
                    as: 'employment',
                    include: [
                        {
                            model: db.Position,
                            as: 'position'
                        }
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    Filter
                    ? {
                        [Op.or]: [
                            { '$employment.position.name$': { [Op.like]: `%${Filter}%` } },
                            { 'first_name': { [Op.like]: `%${Filter}%` } },
                            { 'middle_name': { [Op.like]: `%${Filter}%` } },
                            { 'last_name': { [Op.like]: `%${Filter}%` } }
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

exports.GetApplicant = async (req, res) => {
    try {
        const data = await db.Applicant.findAll({
            where: {
                status: 'Hired',
                is_active: true
            },
            include: [
                {
                    model: db.Vacancy,
                    as: 'vacancy'
                },
                {
                    model: db.ApplicantEducation,
                    as: 'educations'
                },
                {
                    model: db.ApplicantExperience,
                    as: 'experiences'
                },
                {
                    model: db.ApplicantTraining,
                    as: 'trainings'
                },
                {
                    model: db.ApplicantDocument,
                    as: 'documents'
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
exports.GetPosition = async (req, res) => {
    try {
        const data = await db.Position.findAll({
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
                            WHEN 'Monthly' THEN FORMAT(monthly_salary, 2)
                            WHEN 'Daily' THEN FORMAT(daily_salary, 2)
                            WHEN 'Hourly' THEN FORMAT(hourly_salary, 2)
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
exports.GetLeaveType = async (req, res) => {
    try {
        const data = await db.LeaveType.findAll({
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};
const GetEmployee = async (id) => {
    return await db.Employee.findOne({
        include: [
            {
                model: db.Employment,
                as: 'employment',
                include: [
                    {
                        model: db.Position,
                        as: 'position'
                    }
                ]
            }
        ],
        where: {
            id
        },
    });
}

const GetSalaryAmount = (position) => {
    switch (position.salary_type) {
        case 'Monthly':
            return position.monthly_salary;
        case 'Daily':
            return position.daily_salary;
        case 'Hourly':
            return position.hourly_salary;
        default:
            throw new Error(`Invalid salary type: ${position.salary_type}`);
    }
};

exports.Create = async (req, res) => {

    const { 
        //employee
        applicantId,
        firstname,
        middlename,
        lastname,
        suffix,
        sex,
        civilstatus,
        birthdate,
        birthplace,
        address,
        bloodtype,
        email,
        contactNo,
        //employment
        employeeNo,
        dateHired,
        departmentId,
        positionId,
        employmentstatus,
        tin,
        sssNo,
        philhealthNo,
        pagibigNo,
        //salary
        salarygroup,
        payrollgroup,
        taxstatus,
        // shift
        shiftId,
        effectiveFrom,
        effectiveTo,
        notes
    } = req.body;
    
    const transaction = await sequelize.transaction();

    try {

        const year = new Date(dateHired).getFullYear().toString();
        const latest = await db.Employment.findOne({
        where: {
            employee_no: {
            [Op.like]: `${year}-%`
            }
        },
        order: [['employee_no', 'DESC']]
        });
        const nextSeq = latest
            ? parseInt(latest.employee_no.split('-')[1], 10) + 1
            : 1;
        const newEmployeeNo = `${year}-${String(nextSeq).padStart(3, '0')}`;


        //employee
        const employee = await db.Employee.create({
            first_name: firstname,
            middle_name: middlename,
            last_name: lastname,
            suffix,
            sex,
            civil_status: civilstatus,
            birthdate,
            birthplace,
            blood_type: bloodtype,
            address,
            email,
            contact_number: contactNo
        }, { transaction });
        //employment
        await db.Employment.create({
            employee_id: employee.id,
            employee_no: (employeeNo?.trim() ? employeeNo : newEmployeeNo),
            date_hired: dateHired,
            tin,
            sss_no: sssNo,
            philhealth_no: philhealthNo,
            pagibig_no: pagibigNo,
            department_id: departmentId,
            employment_status: employmentstatus,
            tax_status: taxstatus,
            position_id: positionId,
            payroll_group: payrollgroup
        }, { transaction });
        // salary
        const position = await db.Position.findByPk(positionId);
        const amount = GetSalaryAmount(position);
        await db.SalarySchedule.create({
            employee_id: employee.id,
            amount: amount,
            salary_type: position.salary_type,
            salary_group: salarygroup,
            effective_date: dateHired
        }, { transaction });
        await position.update({
            status: 'Filled'
        }, { transaction })
        //shift
        await db.EmployeeShift.create({
            employee_id: employee.id,
            shift_id: shiftId,
            effective_from: effectiveFrom,
            effective_to: effectiveTo || null,
            notes
        }, { transaction })
        
        if (applicantId) {
            // EDUCATIONS
            const educations = await db.ApplicantEducation.findAll({ where: { applicant_id: applicantId } });
            if (educations.length) {
                await db.EmployeeEducation.bulkCreate(
                    educations.map(e => ({
                        employee_id: employee.id,
                        school_level: e.school_level,
                        school_id: e.school_id,
                        course_id: e.course_id,
                        start_date: e.start_date,
                        end_date: e.end_date
                    }))
                );
            }

            // TRAININGS
            const trainings = await db.ApplicantTraining.findAll({ where: { applicant_id: applicantId } });
            if (trainings.length) {
                await db.EmployeeTraining.bulkCreate(
                    trainings.map(t => ({
                        employee_id: employee.id,
                        title: t.title,
                        type: t.type,
                        start_date: t.start_date,
                        end_date: t.end_date,
                        hour: t.hour
                    })), { transaction }
                );
            }

            // EXPERIENCES
            const experiences = await db.ApplicantExperience.findAll({ where: { applicant_id: applicantId } });
            if (experiences.length) {
                await db.EmployeeExperience.bulkCreate(
                    experiences.map(x => ({
                        employee_id: employee.id,
                        position: x.position,
                        description: x.description,
                        start_date: x.start_date,
                        end_date: x.end_date
                    })), { transaction }
                );
            }

            // DOCUMENTS
            const documents = await db.ApplicantDocument.findAll({ where: { applicant_id: applicantId } });
            if (documents.length) {
                await db.EmployeeDocument.bulkCreate(
                    documents.map(f => ({
                        employee_id: employee.id,
                        document: f.document,
                        filename: f.filename
                    })), { transaction }
                );
            }

            // DEACTIVATE APPLICANT (only if applicantId is valid)
            await db.Applicant.update(
                    { is_active: false },
                    { where: { id: applicantId }, transaction }
                );
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

/**
 * Employee
 */
exports.GetEmployeeRecord = async (req, res) => {

    const id = parseInt(req.params.id);

    try {

        const rows = await db.Employee.findOne({
            where: {
                id
            },
            include: [
                {
                    model: db.Employment,
                    as: 'employment',
                    include: [
                        {
                            model: db.Position,
                            as: 'position'
                        }
                    ]
                },
                {
                    model: db.EmployeePhoto,
                    as: 'photo',
                    attributes: ['filename', 'avatar']
                }
            ]
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.UpdateEmployee = async (req, res) => {

    const { 
        id 
    } = req.params;

    const {
        firstname,
        middlename,
        lastname,
        suffix,
        sex,
        civilstatus,
        birthdate,
        birthplace,
        address,
        email,
        contactNo,
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        const employee = await db.Employee.findByPk(id);
        if (!employee) {
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

        await employee.update({ 
            first_name: firstname,
            middle_name: middlename,
            last_name: lastname,
            suffix,
            sex,
            civil_status: civilstatus,
            birthdate,
            birthplace,
            address,
            email,
            contact_number: contactNo
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!"
        });

    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};
/**
 * Employee
 */

/**
 * Employment
 */
exports.UpdateEmployment = async (req, res) => {

    const { 
        id 
    } = req.params;

    const transaction = await sequelize.transaction();

    const {
        employeeNo,
        dateHired,
        departmentId,
        employmentstatus,
        tin,
        sssNo,
        philhealthNo,
        pagibigNo
    } = req.body;

    try {

        const employment = await db.Employment.findByPk(id);
        if (!employment) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: employeeNo,
                    msg: "Record not found!",
                    path: "employeeNo",
                    location: "body",
                }],
            });
        }

        await employment.update({ 
            employee_no: employeeNo,
            date_hired: dateHired,
            department_id: departmentId,
            employment_status: employmentstatus,
            tin,
            sss_no: sssNo,
            philhealth_no: philhealthNo,
            pagibig_no: pagibigNo
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!"
        });

    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};
/**
 * Employment
 */

/**
 * Salary
 */
exports.CreateSalary = async (req, res) => {
    const { 
        id 
    } = req.params
    const { 
        positionid, 
        datestart, 
        dateend, 
        salarygroup, 
        amount, 
        salarytype, 
        notes,
        payrollgroup,
        taxstatus
    } = req.body

    const transaction = await sequelize.transaction();

    try {

        if (!datestart || !moment(datestart, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({ error: 'Invalid or missing dateStart.' })
        }

        const parsedEndDate =
            dateend && moment(dateend, 'YYYY-MM-DD', true).isValid()
                ? dateend
                : null

        const employment = await db.Employment.findOne({ 
            where: { 
                id 
            } 
        })
        if (!employment) {
            return res.status(404).json({ error: 'Employment not found.' })
        }

        const isNewPosition = positionid && Number(positionid) !== employment.position_id

        if (isNewPosition) {
            const previousSalary = await db.SalarySchedule.findOne({
                where: {
                    employee_id: employment.employee_id,
                    is_active: true,
                    end_date: null
                },
                order: [['effective_date', 'DESC']]
            })

            if (previousSalary) {
                const newEndDate = moment(datestart)
                    .subtract(1, 'days')
                    .format('YYYY-MM-DD')

                if (!moment(newEndDate, 'YYYY-MM-DD', true).isValid()) {
                    return res.status(400).json({ error: 'Computed end date is invalid.' })
                }

                previousSalary.end_date = newEndDate
                previousSalary.is_active = false
                await previousSalary.save({ transaction })
            }

            if (employment.position_id) {
                await db.Position.update({ 
                    status: 'Vacant' 
                }, { 
                    where: { 
                        id: employment.position_id 
                    },
                    transaction
                })
            }

            await db.Position.update({ 
                status: 'Filled' 
            }, { 
                where: { 
                    id: positionid 
                }, transaction
            })

            employment.position_id = positionid
            await employment.save({ transaction })
        }

        await db.SalarySchedule.create({
            employee_id: employment.employee_id,
            amount: Number(String(amount).replace(/,/g, '')),
            salary_type: salarytype,
            salary_group: salarygroup,
            effective_date: datestart,
            end_date: parsedEndDate,
            notes: notes ?? '',
            is_active: true
        }, { transaction })

        await employment.update({
            tax_status: taxstatus,
            payroll_group: payrollgroup
        }, { transaction })

        await transaction.commit();

        return res.status(201).json({
            message: 'Record Saved!'
        })

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: error.message })
    }
}

/**
 * Salary
 */

/**
 * Service Record
 */
exports.GetServiceRecord = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await db.SalarySchedule.findAll({
            where: {
                employee_id: id
            },
            order: [['effective_date', 'DESC']]
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.RemoveSalary = async (req, res) => {

    const { 
        id 
    } = req.params;

    const transaction = await sequelize.transaction();
    
    try {

        const salary = await db.SalarySchedule.findByPk(id);

        if (!salary) {
            return res.status(404).json({
                error: 'Salary record not found'
            });
        }

        // Set end_date to today and deactivate
        await salary.update({
            end_date: new Date(),
            is_active: false
        }, { transaction });

        await transaction.commit();

        res.json({
            message: 'Record Updated!'
        });

    } catch (error) {

        await transaction.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};
/**
 * Service Record
 */

/**
 * Photo
 */
exports.GetPhoto = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await db.EmployeePhoto.findOne({
            where: {
                employee_id: id
            }
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.CreatePhoto = async (req, res) => {

    const { id } = req.params;

    const transaction = await sequelize.transaction();
    
    try {

        const file = req.file;
        const filePath = `/uploads/avatar/${file.filename}`; // public URL path (served from /public)

        const exist = await db.EmployeePhoto.findOne({
            where: { 
                employee_id: id 
            },
        });

        // If you want to delete the previous physical file
        if (exist?.avatar) {
            const oldRel = exist.avatar.replace("/uploads/avatar/", "");
            const oldAbs = path.join(__dirname, "../public/uploads/avatar", oldRel);

            // delete old file if exists
            if (fs.existsSync(oldAbs)) {
                fs.unlinkSync(oldAbs);
            }
        }

        if (exist) {
            await exist.update({
                filename: file.filename,
                avatar: filePath,
            }, { transaction });
        } else {
            await db.EmployeePhoto.create({
                employee_id: id,
                filename: file.filename,
                avatar: filePath,
            }, { transaction });
        }

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!",
        });

    } catch (error) {

        await transaction.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};
/**
 * Photo
 */
/**
 * Account
 */
exports.GetAccount = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await db.EmployeeAccount.findAll({
            where: {
                employee_id: id
            },
            include: [
                {
                    model: db.User,
                    as: 'user',
                    attributes: ['username', 'role', 'status']
                }
            ]
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.CreateAccount = async (req, res) => {

    const {
        id
    } = req.params;

    const { 
        accounts
    } = req.body;

    const transaction = await sequelize.transaction();
    
    try {
        const accs = Array.isArray(accounts) ? accounts : [];

        const avatars = await db.EmployeePhoto.findOne({
            where: {
                employee_id: id
            }
        })

        const existingAccounts = await db.EmployeeAccount.findAll({
            where: { employee_id: id }
        });

        const existingIds = existingAccounts.map(e => e.id);
        const sentIds = accs.filter(a => a.id).map(a => a.id);

        for (const acc of accs) {
            let user;

            if (acc.id && existingIds.includes(acc.id)) {
                // UPDATE existing account
                const empAcc = await db.EmployeeAccount.findByPk(acc.id, {
                    include: [{ model: db.User, as: 'user' }]
                });

                if (!empAcc) continue;

                user = empAcc.user;

                await user.update({
                    username: acc.username,
                    role: acc.role,
                    status: acc.status
                }, { transaction });

                if (acc.password) {
                    const hashed = await bcrypt.hash(acc.password, 10);
                    await user.update({ password: hashed }, { transaction });
                }

                await empAcc.update({ is_active: true }, { transaction });

            } else {
                // CREATE new User + Account
                const hashed = await bcrypt.hash(acc.password, 10);
                const emp = await db.Employee.findByPk(id);
                const middleInitial = emp.middle_name ? `${emp.middle_name.charAt(0)}.` : ''
                const fullName = `${emp.first_name} ${middleInitial} ${emp.last_name}`.trim() + (emp.suffix ? ` ${emp.suffix}` : '')
                user = await db.User.create({
                    name: fullName,
                    username: acc.username,
                    password: hashed,
                    role: acc.role,
                    status: acc.status,
                    avatar: avatars.avatar
                }, { transaction });

                await db.EmployeeAccount.create({
                    employee_id: id,
                    user_id: user.id,
                    is_active: true
                }, { transaction });
            }
        }

        // DEACTIVATE removed accounts
        const toDeactivate = existingIds.filter(id => !sentIds.includes(id));

        if (toDeactivate.length > 0) {
        await db.EmployeeAccount.update(
            { is_active: false },
            { where: { id: toDeactivate } }, transaction
        );
        }

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!"
        });

    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};
/**
 * Account
 */


/**
 * Face Recognition
 */
exports.CreateBiometric = async (req, res) => {
    const { id } = req.params;
        const { descriptor, imageBase64 } = req.body;
    try {

        const face = await db.EmployeeFace.findOne({
            where: { employee_id: id }
        });

        if (face) {
            await face.update({
                descriptor: JSON.stringify(descriptor),
                image_file: imageBase64
            }) 
        } else {
            await db.EmployeeFace.create({
                employee_id: id,
                descriptor: JSON.stringify(descriptor),
                image_file: imageBase64
            })
        }

        return res.status(201).json({
        message: 'Record Saved!'
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}
/**
 * Face Recognition
 */

/**
 * Education
 */
exports.GetEducation = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await db.EmployeeEducation.findAll({
            where: {
                employee_id: id,
                is_active: true
            }
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.UpdateEducation = async (req, res) => {

    const {
        id
    } = req.params;

    const { 
        educations
    } = req.body;

    const transaction = await sequelize.transaction();
    
    try {
        const educ = Array.isArray(educations) ? educations : [];
        
        const existingRecords = await db.EmployeeEducation.findAll({
            where: {
                employee_id: id, 
                is_active: true 
            }
        });
        
        const existingIds = existingRecords.map(e => e.id);
        const sentIds = educ.filter(e => e.id).map(e => e.id);

        for (const edu of educ) {
            if (edu.id && existingIds.includes(edu.id)) {
                // UPDATE if exists
                await db.EmployeeEducation.update({
                    school_level: edu.schoollevel,
                    school_id: edu.schoolId,
                    course_id: edu.courseId,
                    start_date: edu.startDate,
                    end_date: edu.endDate
                }, {
                    where: { 
                        id: edu.id 
                    }
                }, { transaction });
            } else {
                // INSERT new record
                await db.EmployeeEducation.create({
                    employee_id: id,
                    school_level: edu.schoollevel,
                    school_id: edu.schoolId,
                    course_id: edu.courseId,
                    start_date: edu.startDate,
                    end_date: edu.endDate
                }, { transaction });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await db.EmployeeEducation.update(
                { 
                    is_active: false 
                },
                { 
                    where: { 
                        id: toDeactivate 
                    }, transaction
                }
            );
        }

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!"
        });

    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};
/**
 * Eduaction
 */

/**
 * Training
 */
exports.GetTraining = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await db.EmployeeTraining.findAll({
            where: {
                employee_id: id,
                is_active: true
            }
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.UpdateTraining = async (req, res) => {

    const {
        id
    } = req.params;

    const { 
        trainings
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        const training = Array.isArray(trainings) ? trainings : [];

        const existingRecords = await db.EmployeeTraining.findAll({
            where: { 
                employee_id: id, 
                is_active: true 
            }
        });

        const existingIds = existingRecords.map(e => e.id);
        const sentIds = training.filter(e => e.id).map(e => e.id);

        for (const tr of training) {
            if (tr.id && existingIds.includes(tr.id)) {
                // UPDATE if exists
                await db.EmployeeTraining.update({
                    title: tr.title,
                    type: tr.trainingtype,
                    start_date: tr.startDate,
                    end_date: tr.endDate,
                    hour: tr.hour
                }, {
                    where: { 
                        id: tr.id 
                    }
                }, { transaction });
            } else {
                // INSERT new record
                await db.EmployeeTraining.create({
                    employee_id: id,
                    title: tr.title,
                    type: tr.trainingtype,
                    start_date: tr.startDate,
                    end_date: tr.endDate,
                    hour: tr.hour
                }, { transaction });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await db.EmployeeTraining.update(
                { 
                    is_active: false 
                },
                { 
                    where: { 
                        id: toDeactivate 
                    }, transaction
                }
            );
        }

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!"
        });
        
    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};
/**
 * Training
 */

/**
 * Experience
 */
exports.GetExperience = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await db.EmployeeExperience.findAll({
            where: {
                employee_id: id,
                is_active: true
            }
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.UpdateExperience = async (req, res) => {

    const {
        id
    } = req.params;

    const { 
        experiences
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        const experience = Array.isArray(experiences) ? experiences : [];

        const existingRecords = await db.EmployeeExperience.findAll({
            where: { 
                employee_id: id, 
                is_active: true 
            }
        });
        const existingIds = existingRecords.map(e => e.id);
        const sentIds = experience.filter(e => e.id).map(e => e.id);

        for (const exp of experience) {
            if (exp.id && existingIds.includes(exp.id)) {
                // UPDATE if exists
                await db.EmployeeExperience.update({
                    position: exp.position,
                    start_date: exp.startDate,
                    end_date: exp.endDate,
                    description: exp.description
                }, {
                    where: { 
                        id: exp.id 
                    }
                }, { transaction });
            } else {
                // INSERT new record
                await db.EmployeeExperience.create({
                    employee_id: id,
                    position: exp.position,
                    start_date: exp.startDate,
                    end_date: exp.endDate,
                    description: exp.description
                }, { transaction });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await db.EmployeeExperience.update(
                { 
                    isActive: false 
                },
                { 
                    where: { 
                        id: toDeactivate 
                    }, transaction
                }
            );
        }

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!"
        });
        
    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};
/**
 * Experience
 */

/**
 * Dependent
 */
exports.GetDependent = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await db.EmployeeDependent.findAll({
            where: {
                employee_id: id,
                is_active: true
            }
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.UpdateDependent = async (req, res) => {

    const {
        id
    } = req.params;

    const { 
        dependents
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        const dependent = Array.isArray(dependents) ? dependents : [];

        const existingRecords = await db.EmployeeDependent.findAll({
            where: { 
                employee_id: id, 
                is_active: true 
            }
        });
        const existingIds = existingRecords.map(e => e.id);
        const sentIds = dependent.filter(e => e.id).map(e => e.id);

        for (const dep of dependent) {
            if (dep.id && existingIds.includes(dep.id)) {
                // UPDATE if exists
                await db.EmployeeDependent.update({
                    relationship: dep.relationship,
                    first_name: dep.firstname,
                    middle_name: dep.middlename,
                    last_name: dep.lastname,
                    suffix: dep.suffix,
                    birthdate: dep.birthdate,
                    contact_number: dep.contactNo,
                    email: dep.email,
                    address: dep.address,
                    is_emergency: dep.isEmergency
                }, {
                    where: { 
                        id: dep.id 
                    }
                }, { transaction });
            } else {
                // INSERT new record
                await db.EmployeeDependent.create({
                    employee_id: id,
                    relationship: dep.relationship,
                    first_name: dep.firstname,
                    middle_name: dep.middlename,
                    last_name: dep.lastname,
                    suffix: dep.suffix,
                    birthdate: dep.birthdate,
                    contact_number: dep.contactNo,
                    email: dep.email,
                    address: dep.address,
                    is_emergency: dep.isEmergency
                }, { transaction });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await db.EmployeeDependent.update(
                { 
                    is_active: false 
                },
                { 
                    where: { 
                        id: toDeactivate 
                    }, transaction
                }
            );
        }

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!"
        });
        
    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};
/**
 * Dependent
 */

/**
 * Document
 */
exports.GetDocument = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await db.EmployeeDocument.findAll({
            where: {
                employee_id: id,
                is_active: true
            }
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.CreateDocument = async (req, res) => {
    const { id } = req.params;

    try {
        const files = req.files || [];

        if (!files.length) {
        return res.status(400).json({ error: "No files uploaded." });
        }

        for (const file of files) {
            const filePath = `/uploads/documents/${file.filename}`;

            await db.EmployeeDocument.create({
                employee_id: id,
                document: filePath,
                filename: file.originalname,
            });
        }

        return res.status(201).json({
        message: "Record Saved!"
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Document
 */

/**
 * Attendance
 */
// controllers/AttendanceController.js
// Assumes you already have somewhere at top-level:
// const db = require("../models");
// const { Op } = require("sequelize");
// const moment = require("moment");

const pos = (n) => (n > 0 ? n : 0);

const combineDayTime = (workDay, timeStr) => {
  const t = (timeStr || "").trim();
  if (!t) return moment.invalid();

  // Accept HH:mm or HH:mm:ss
  const m = moment(
    `${workDay} ${t}`,
    ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"],
    true
  );

  // If still invalid, try padding seconds
  if (!m.isValid() && t.length === 5) {
    return moment(`${workDay} ${t}:00`, "YYYY-MM-DD HH:mm:ss", true);
  }

  return m;
};

const pickEffectiveEmployeeShift = (employeeShifts, workDayYMD) => {
  const day = moment(workDayYMD, "YYYY-MM-DD", true);

  const valid = (employeeShifts || [])
    .filter((es) => es.is_active)
    .filter((es) => {
      const from = moment(es.effective_from, "YYYY-MM-DD", true);
      const to = es.effective_to ? moment(es.effective_to, "YYYY-MM-DD", true) : null;
      return from.isSameOrBefore(day, "day") && (!to || to.isSameOrAfter(day, "day"));
    })
    .sort((a, b) => moment(b.effective_from).diff(moment(a.effective_from)));

  return valid[0] || null;
};

const overlapMinutes = (aStart, aEnd, bStart, bEnd) => {
  const start = moment.max(aStart, bStart);
  const end = moment.min(aEnd, bEnd);
  const diff = end.diff(start, "minutes");
  return diff > 0 ? diff : 0;
};

// Approved overtime schedules for employee on workDay
const getApprovedOvertimesForDay = async ({ employeeId, workDay, transaction }) => {
  return db.EmployeeOvertimeApplication.findAll({
    where: {
      employee_id: employeeId,
      status: "Approved",
    },
    include: [
      {
        model: db.Overtime,
        as: "overtime",
        required: true,
        where: {
          date: workDay,
          status: "Approved",
          is_active: true,
        },
      },
    ],
    transaction,
  });
};

exports.GetAttendance = async (req, res) => {
  // ✅ req.params.id = employee_id
  const employeeId = parseInt(req.query.id, 10);

  const year = req.query.year ? String(req.query.year) : null;   // e.g. "2026"
  const month = req.query.month ? String(req.query.month).padStart(2, "0") : null; // e.g. "02"

  // ✅ Helpers
  const formatTime = (t) => (t ? moment(t, ["HH:mm:ss", "HH:mm"]).format("HH:mm") : "");
  const formatTimeHHmmA = (t) => (t ? moment(t, ["HH:mm:ss", "HH:mm"]).format("hh:mm A") : "");

  try {
    if (!employeeId || !year || !month) {
      return res.status(400).json({
        error: "Missing required params. Use req.params.id (employeeId) and req.query.year/month.",
      });
    }

    const monthStart = moment(`${year}-${month}-01`, "YYYY-MM-DD", true).startOf("day");
    if (!monthStart.isValid()) {
      return res.status(400).json({ error: "Invalid year/month." });
    }
    const monthEnd = monthStart.clone().endOf("month").endOf("day");

    // 1️⃣ Attendance period that overlaps the month
    const attendance = await db.Attendance.findOne({
      where: {
        employee_id: employeeId,
        date_from: { [Op.lte]: monthEnd.format("YYYY-MM-DD") },
        date_to: { [Op.gte]: monthStart.format("YYYY-MM-DD") },
      },
      order: [["date_from", "DESC"]],
      include: [
        {
          model: db.EmployeeAttendance,
          as: "days",
          separate: true,
          order: [["work_day", "ASC"]],
        },
      ],
    });

    if (!attendance) {
      const emptyResults = [];
      let d = monthStart.clone().startOf("day");
      const e = monthEnd.clone().startOf("day");

      while (d.isSameOrBefore(e, "day")) {
        emptyResults.push({
          date: d.format("YYYY-MM-DD"),
          attendance_id: null,
          adjustment_id: null,
          time_in: "",
          time_out: "",
          original_time_in: "",
          original_time_out: "",
          adjusted_time_in: null,
          adjusted_time_out: null,
          late: 0,
          undertime: 0,
          overtime: 0,
          logs: ["", "", "", ""],
          notes: [],
        });
        d.add(1, "day");
      }

      return res.json({
        attendance_id: null,
        employee_id: employeeId,
        date_from: monthStart,
        date_to: monthEnd,
        logs: emptyResults,
      });
    }

    // ✅ Iterate over ACTUAL attendance period
    const startDate = moment(attendance.date_from).format("YYYY-MM-DD");
    const endDate = moment(attendance.date_to).format("YYYY-MM-DD");

    // ✅ 1.5 EmployeeShift (effective dating) + Shift + ShiftDays
    const employeeShifts = await db.EmployeeShift.findAll({
      where: { employee_id: employeeId },
      include: [
        {
          model: db.Shift,
          as: "shift",
          include: [{ model: db.ShiftDay, as: "days" }],
        },
      ],
      order: [["effective_from", "DESC"]],
    });

    // 2️⃣ Leaves within attendance range
    const leaves = await db.EmployeeLeaveApplication.findAll({
      where: {
        employee_id: employeeId,
        status: "Approved",
        date_from: { [Op.lte]: endDate },
        date_to: { [Op.gte]: startDate },
      },
      include: [{ model: db.LeaveType, as: "leaveType" }],
    });

    // 3️⃣ Holidays within attendance range
    const holidays = await db.Holiday.findAll({
      where: {
        date: { [Op.between]: [startDate, endDate] },
        isActive: true,
      },
    });

    // 4️⃣ Overtime applications within attendance range (for NOTES map)
    const overtimes = await db.EmployeeOvertimeApplication.findAll({
      where: {
        employee_id: employeeId,
        status: "Approved",
      },
      include: [
        {
          model: db.Overtime,
          as: "overtime",
          required: true,
          where: {
            date: { [Op.between]: [startDate, endDate] },
            status: "Approved",
          },
        },
      ],
    });

    // ✅ 4.5 Adjustments (latest first) under this attendance record
    const adjustments = await db.EmployeeAttendanceAdjustment.findAll({
      include: [
        {
          model: db.EmployeeAttendance,
          as: "attendance",
          required: true,
          where: { attendance_id: attendance.id },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // ✅ 4.6 EmployeeLogs filtered by MONTH (captured_at within month)
    const logRows = await db.EmployeeLog.findAll({
      where: {
        employee_id: employeeId,
        captured_at: {
          [Op.between]: [monthStart.toDate(), monthEnd.toDate()],
        },
      },
      attributes: ["captured_at"],
      order: [["captured_at", "ASC"]],
    });

    // 5️⃣ Build lookup maps
    const leaveMap = {};
    for (const leave of leaves) {
      let d = moment(leave.date_from);
      const end = moment(leave.date_to);
      while (d.isSameOrBefore(end)) {
        leaveMap[d.format("YYYY-MM-DD")] = leave.leaveType?.name || "";
        d.add(1, "day");
      }
    }

    const holidayMap = {};
    for (const h of holidays) {
      holidayMap[moment(h.date).format("YYYY-MM-DD")] = h.name;
    }

    const overtimeMap = {};
    for (const otApp of overtimes) {
      const ot = otApp.overtime;
      const key = moment(ot.date).format("YYYY-MM-DD");
      if (!overtimeMap[key]) overtimeMap[key] = [];
      overtimeMap[key].push({
        start: ot.time_start ? formatTime(ot.time_start) : "",
        end: ot.time_end ? formatTime(ot.time_end) : "",
        description: ot.description || "",
        status: ot.status,
      });
    }

    // ✅ logsMap => time strings only per day + ALWAYS padded to 4 for EVERY date
    const logsMap = {};

    // 1) group logs by PH date
    for (const log of logRows) {
      // ✅ DB time assumed UTC -> convert to PH (+08:00) BEFORE grouping
      const m = moment.utc(log.captured_at);

      const key = m.format("YYYY-MM-DD");
      const t = m.format("HH:mm");

      if (!logsMap[key]) logsMap[key] = [];
      logsMap[key].push(t);
    }

    // 2) for every date in ATTENDANCE RANGE, ensure padded array of 4
    let padDay = moment(startDate, "YYYY-MM-DD");
    const padEnd = moment(endDate, "YYYY-MM-DD");

    while (padDay.isSameOrBefore(padEnd)) {
      const key = padDay.format("YYYY-MM-DD");

      const times = logsMap[key] ? [...new Set(logsMap[key])].sort() : [];

      const paddedTimes =
        times.length < 4
          ? [...times, ...Array(4 - times.length).fill("")]
          : times.slice(0, 4);

      logsMap[key] = paddedTimes;

      padDay.add(1, "day");
    }

    // EmployeeAttendance days by date
    const dayMap = {};
    for (const d of attendance.days || []) {
      dayMap[moment(d.work_day).format("YYYY-MM-DD")] = d;
    }

    // latest adjustment by employee_attendance_id (newest wins)
    const adjustmentMap = {};
    for (const adj of adjustments) {
      if (!adjustmentMap[adj.employee_attendance_id]) {
        adjustmentMap[adj.employee_attendance_id] = adj;
      }
    }

    // 6️⃣ Generate results rows for each day in ATTENDANCE range
    const results = [];
    let day = moment(startDate);
    const endDay = moment(endDate);

    while (day.isSameOrBefore(endDay)) {
      const formatted = day.format("YYYY-MM-DD");
      const dtr = dayMap[formatted];

      const notes = [];

      if (holidayMap[formatted]) notes.push({ type: "holiday", name: holidayMap[formatted] });
      if (leaveMap[formatted]) notes.push({ type: "leave", name: leaveMap[formatted] });

      if (overtimeMap[formatted]?.length) {
        overtimeMap[formatted].forEach((ot) => {
          notes.push({
            type: "overtime",
            name: `ot (${formatTimeHHmmA(ot.start)} to ${formatTimeHHmmA(ot.end)})`,
          });
        });
      }

      const adjustment = dtr ? adjustmentMap[dtr.id] : null;
      if (adjustment) notes.push({ type: "adjustment", name: adjustment.reason });

      // ✅ time source: latest adjustment OR attendance
      const originalTimeIn = formatTime(dtr?.time_in);
      const originalTimeOut = formatTime(dtr?.time_out);

      const adjustedTimeIn = adjustment ? formatTime(adjustment.adjusted_time_in) : null;
      const adjustedTimeOut = adjustment ? formatTime(adjustment.adjusted_time_out) : null;

      const finalTimeIn = adjustedTimeIn || originalTimeIn;
      const finalTimeOut = adjustedTimeOut || originalTimeOut;

      // ✅ Shift for this date
      const effective = pickEffectiveEmployeeShift(employeeShifts, formatted);
      const shift = effective?.shift || null;

      let late = 0;
      let undertime = 0;
      let overtime = 0;

      if (shift && finalTimeIn && finalTimeOut) {
        const shiftDaySet = new Set((shift.days || []).map((sd) => Number(sd.day_of_week)));
        const isoDow = moment(formatted, "YYYY-MM-DD").isoWeekday();
        const isShiftDay = shiftDaySet.size ? shiftDaySet.has(isoDow) : true;

        const schedInStr =
          shift.time_in || shift.time_start || shift.timeStart || shift.start_time;
        const schedOutStr =
          shift.time_out || shift.time_end || shift.timeEnd || shift.end_time;

        const schedStart = combineDayTime(formatted, schedInStr);
        const schedEnd = combineDayTime(formatted, schedOutStr);

        const actualStart = combineDayTime(formatted, finalTimeIn);
        const actualEnd = combineDayTime(formatted, finalTimeOut);

        const schedOk = schedStart.isValid() && schedEnd.isValid() && schedEnd.isAfter(schedStart);
        const actualOk = actualStart.isValid() && actualEnd.isValid() && actualEnd.isAfter(actualStart);

        const isHoliday = !!holidayMap[formatted];
        const isLeave = !!leaveMap[formatted];

        if (schedOk && actualOk && isShiftDay && !isHoliday && !isLeave) {
          late = pos(actualStart.diff(schedStart, "minutes"));
          undertime = pos(schedEnd.diff(actualEnd, "minutes"));

          const approvedOTs = await getApprovedOvertimesForDay({
            employeeId,
            workDay: formatted,
            transaction: null,
          });

          overtime = 0;
          for (const otApp of approvedOTs || []) {
            const ot = otApp.overtime;
            if (!ot) continue;

            const otStart = combineDayTime(formatted, ot.time_start || ot.timeStart);
            const otEnd = combineDayTime(formatted, ot.time_end || ot.timeEnd);

            if (otStart.isValid() && otEnd.isValid() && otEnd.isAfter(otStart)) {
              overtime += overlapMinutes(actualStart, actualEnd, otStart, otEnd);
            }
          }
        }
      }

      results.push({
        date: formatted,

        attendance_id: dtr?.id || null,
        adjustment_id: adjustment?.id || null,

        time_in: finalTimeIn,
        time_out: finalTimeOut,

        original_time_in: originalTimeIn,
        original_time_out: originalTimeOut,
        adjusted_time_in: adjustedTimeIn,
        adjusted_time_out: adjustedTimeOut,

        late,
        undertime,
        overtime,

        // ✅ ALWAYS padded now
        logs: logsMap[formatted],

        notes,
      });

      day.add(1, "day");
    }

    return res.json({
      attendance_id: attendance.id,
      employee_id: attendance.employee_id,
      date_from: startDate,
      date_to: endDate,
      logs: results,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


/**
 * Attendance
 */

/**
 * Leave
 */
exports.GetLeaveBalance = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await db.EmployeeLeaveBalance.findAll({
            include: [
                {
                    model: db.LeaveType,
                    as: 'leaveType'
                }
            ],
            where: {
                employee_id: id,
                is_active: true
            }
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.GetLeaveApplication = async (req, res) => {

    const id = parseInt(req.query.id);

    const month = req.query.month;
    const year = req.query.year;

    const startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');

    try {

        const rows = await db.EmployeeLeaveApplication.findAll({
            include: [
                {
                    model: db.LeaveType,
                    as: 'leaveType'
                }
            ],
            where: {
                employee_id: id,
                [Op.and]: [
                    { date_from: { [Op.lte]: endDate } }, // leave starts before or on endOfMonth
                    { date_to: { [Op.gte]: startDate } }  // leave ends after or on startOfMonth
                ]
            },
            order: [['date_from', 'DESC']]
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
exports.CreateLeave = async (req, res) => {

    const {
        id
    } = req.params;
    
    const {
        leaves
    } = req.body;

    try {

        for (const leave of leaves) {
            await db.EmployeeLeaveBalance.create({
                employee_id: id,
                leave_type_id: leave.leavetypeid,
                credit: leave.credit,
                earned: leave.earned,
                used: leave.used,
                balance: (Number(leave.earned) || 0) - (Number(leave.used) || 0)
            });
        }

        res.status(201).json({
            message: "Record Saved!"
        });
        
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};
/**
 * Leave
 */