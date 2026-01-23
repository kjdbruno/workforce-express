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

const { Employee, Employment, Position, Applicant, Vacancy, Company, Department, Schedule, Course, School, ApplicantEducation, ApplicantExperience, ApplicantTraining, ApplicantDocument, SalarySchedule, EmployeeEducation, EmployeeTraining, EmployeeExperience, EmployeeDocument, EmployeeDependent, EmployeeLeaveBalance, LeaveType, EmployeeLeaveApplication, EmployeePhoto, DailyTimeRecord, EmployeeAttendance, EmployeeFace, EmployeeAccount, User } = require("../models");

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {

        const { count, rows } = await Employee.findAndCountAll({
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
        const data = await Applicant.findAll({
            where: {
                status: 'Hired',
                is_active: true
            },
            include: [
                {
                    model: Vacancy,
                    as: 'vacancy'
                },
                {
                    model: ApplicantEducation,
                    as: 'educations'
                },
                {
                    model: ApplicantExperience,
                    as: 'experiences'
                },
                {
                    model: ApplicantTraining,
                    as: 'trainings'
                },
                {
                    model: ApplicantDocument,
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
exports.GetLeaveType = async (req, res) => {
    try {
        const data = await LeaveType.findAll({
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};
const GetEmployee = async (id) => {
    return await Employee.findOne({
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
        employeeNo,
        dateHired,
        salarygroup,
        payrollgroup,
        taxstatus,
        companyId,
        departmentId,
        scheduleId,
        positionId,
        employmentstatus,
        tin,
        sssNo,
        philhealthNo,
        pagibigNo
    } = req.body;
    // const t = await Employee.sequelize.transaction();

    try {

        const year = new Date().getFullYear().toString();
        const latest = await Employment.findOne({
            where: { employee_no: { [Op.like]: `${year}%` } },
            order: [['employee_no', 'DESC']]
        });
        const newEmployeeNo = `${year}${String(
            latest ? parseInt(latest.employee_no.slice(4)) + 1 : 1
        ).padStart(5, '0')}`;

        const employee = await Employee.create({
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
        });
        
        const employment = await Employment.create({
            employee_id: employee.id,
            employee_no: (employeeNo?.trim() ? employeeNo : newEmployeeNo),
            date_hired: dateHired,
            tin,
            sss_no: sssNo,
            philhealth_no: philhealthNo,
            pagibig_no: pagibigNo,
            company_id: companyId,
            department_id: departmentId,
            employment_status: employmentstatus,
            tax_status: taxstatus,
            schedule_id: scheduleId,
            position_id: positionId,
            payroll_group: payrollgroup
        });

        const position = await Position.findByPk(positionId)
        await position.update({
            status: 'Filled'
        })
        const amount = GetSalaryAmount(position);
        const salary = await SalarySchedule.create({
            employee_id: employee.id,
            amount: amount,
            salary_type: position.salary_type,
            salary_group: salarygroup,
            effective_date: dateHired
        });

        
        if (applicantId) {
            // EDUCATIONS
            const educations = await ApplicantEducation.findAll({ where: { applicant_id: applicantId } });
            if (educations.length) {
                await EmployeeEducation.bulkCreate(
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
            const trainings = await ApplicantTraining.findAll({ where: { applicant_id: applicantId } });
            if (trainings.length) {
                await EmployeeTraining.bulkCreate(
                    trainings.map(t => ({
                        employee_id: employee.id,
                        title: t.title,
                        type: t.type,
                        start_date: t.start_date,
                        end_date: t.end_date,
                        hour: t.hour
                    }))
                );
            }

            // EXPERIENCES
            const experiences = await ApplicantExperience.findAll({ where: { applicant_id: applicantId } });
            if (experiences.length) {
                await EmployeeExperience.bulkCreate(
                    experiences.map(x => ({
                        employee_id: employee.id,
                        position: x.position,
                        description: x.description,
                        start_date: x.start_date,
                        end_date: x.end_date
                    }))
                );
            }

            // DOCUMENTS
            const documents = await ApplicantDocument.findAll({ where: { applicant_id: applicantId } });
            if (documents.length) {
                await EmployeeDocument.bulkCreate(
                    documents.map(f => ({
                        employee_id: employee.id,
                        document: f.document,
                        filename: f.filename
                    }))
                );
            }

            // DEACTIVATE APPLICANT (only if applicantId is valid)
            await Applicant.update(
                    { is_active: false },
                    { where: { id: applicantId } }
                );
        }

        const data = await GetEmployee(employee.id);

        res.status(201).json({
            message: "Record Saved!",
            employee: data
        });

    } catch (error) {
        console.log(error)
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

        const rows = await Employee.findOne({
            where: {
                id
            },
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
                },
                {
                    model: EmployeePhoto,
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
        bloodtype,
        email,
        contactNo,
    } = req.body;

    try {

        const employee = await Employee.findByPk(id);
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
            blood_type: bloodtype,
            address,
            email,
            contact_number: contactNo
        });

        res.status(201).json({
            message: "Record Saved!",
            employee
        });

    } catch (error) {

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

    const {
        employeeNo,
        dateHired,
        companyId,
        departmentId,
        scheduleId,
        employmentstatus,
        tin,
        sssNo,
        philhealthNo,
        pagibigNo,
        taxstatus,
        payrollgroup
    } = req.body;

    try {

        const employee = await Employment.findByPk(id);
        if (!employee) {
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

        await employee.update({ 
            employee_no: employeeNo,
            date_hired: dateHired,
            company_id: companyId,
            department_id: departmentId,
            schedule_id: scheduleId,
            employment_status: employmentstatus,
            tin,
            sss_no: sssNo,
            philhealth_no: philhealthNo,
            pagibig_no: pagibigNo,
            tax_status: taxstatus,
            payroll_group: payrollgroup
        });

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
 * Employment
 */

/**
 * Salary
 */
exports.CreateSalary = async (req, res) => {
  const { id } = req.params
  const { positionid, dateStart, dateEnd, salarygroup, amount, salarytype, notes } = req.body

  try {
    if (!dateStart || !moment(dateStart, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ error: 'Invalid or missing dateStart.' })
    }

    const parsedEndDate =
      dateEnd && moment(dateEnd, 'YYYY-MM-DD', true).isValid()
        ? dateEnd
        : null

    const employment = await Employment.findOne({ where: { id } })
    if (!employment) {
      return res.status(404).json({ error: 'Employment not found.' })
    }

    const isNewPosition = positionid && Number(positionid) !== employment.position_id

    // 🔁 Only close previous salary IF position changed
    if (isNewPosition) {
      const previousSalary = await SalarySchedule.findOne({
        where: {
          employee_id: employment.employee_id,
          is_active: true,
          end_date: null
        },
        order: [['effective_date', 'DESC']]
      })

      if (previousSalary) {
        const newEndDate = moment(dateStart)
          .subtract(1, 'days')
          .format('YYYY-MM-DD')

        if (!moment(newEndDate, 'YYYY-MM-DD', true).isValid()) {
          return res.status(400).json({ error: 'Computed end date is invalid.' })
        }

        previousSalary.end_date = newEndDate
        previousSalary.is_active = false
        await previousSalary.save()
      }

      // Update positions
      if (employment.position_id) {
        await Position.update({ status: 'Vacant' }, { where: { id: employment.position_id } })
      }

      await Position.update({ status: 'Filled' }, { where: { id: positionid } })

      employment.position_id = positionid
      await employment.save()
    }

    // Always create new salary record
    const salarySchedule = await SalarySchedule.create({
      employee_id: employment.employee_id,
      amount: Number(String(amount).replace(/,/g, '')),
      salary_type: salarytype,
      salary_group: salarygroup,
      effective_date: dateStart,
      end_date: parsedEndDate,
      notes: notes ?? '',
      is_active: true
    })

    return res.status(201).json({
      message: 'Record Saved!',
      salarySchedule
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * Salary
 */

/**
 * Account
 */
exports.GetAccount = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await EmployeeAccount.findAll({
            where: {
                employee_id: id
            },
            include: [
                {
                    model: User,
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
    
    try {
        const accs = Array.isArray(accounts) ? accounts : [];

        const avatars = await EmployeePhoto.findOne({
            where: {
                employee_id: id
            }
        })

        const existingAccounts = await EmployeeAccount.findAll({
            where: { employee_id: id }
        });

        const existingIds = existingAccounts.map(e => e.id);
        const sentIds = accs.filter(a => a.id).map(a => a.id);

        for (const acc of accs) {
            let user;

            if (acc.id && existingIds.includes(acc.id)) {
                // UPDATE existing account
                const empAcc = await EmployeeAccount.findByPk(acc.id, {
                    include: [{ model: User, as: 'user' }]
                });

                if (!empAcc) continue;

                user = empAcc.user;

                await user.update({
                    username: acc.username,
                    role: acc.role,
                    status: acc.status
                });

                if (acc.password) {
                    const hashed = await bcrypt.hash(acc.password, 10);
                    await user.update({ password: hashed });
                }

                await empAcc.update({ is_active: true });

            } else {
                // CREATE new User + Account
                const hashed = await bcrypt.hash(acc.password, 10);
                const emp = await Employee.findByPk(id);
                const middleInitial = emp.middle_name ? `${emp.middle_name.charAt(0)}.` : ''
                const fullName = `${emp.first_name} ${middleInitial} ${emp.last_name}`.trim() + (emp.suffix ? ` ${emp.suffix}` : '')
                user = await User.create({
                    name: fullName,
                    username: acc.username,
                    password: hashed,
                    role: acc.role,
                    status: acc.status,
                    avatar: avatars.avatar
                });

                await EmployeeAccount.create({
                    employee_id: id,
                    user_id: user.id,
                    is_active: true
                });
            }
        }

        // DEACTIVATE removed accounts
        const toDeactivate = existingIds.filter(id => !sentIds.includes(id));

        if (toDeactivate.length > 0) {
        await EmployeeAccount.update(
            { is_active: false },
            { where: { id: toDeactivate } }
        );
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
 * Account
 */

/**
 * Photo
 */
exports.GetPhoto = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await EmployeePhoto.findOne({
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
    const file = req.file;
    
    try {

        const exist = await EmployeePhoto.findOne({
            where: { employee_id: id }
        });

        if (file) {
            const filename = file.originalname;
            const ext = path.extname(file.originalname).toLowerCase();
            const uploadPath = path.join(__dirname, '../public/avatar', filename);

            let sharpPipeline = sharp(file.buffer).resize({ width: 800 });

            if (ext === '.png') {
                sharpPipeline = sharpPipeline.png({ quality: 80 });
            } else {
                sharpPipeline = sharpPipeline
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: 80 });
            }

            await sharpPipeline.toFile(uploadPath);

            if (exist) {
                await exist.update({
                    filename,
                    avatar: `/avatar/${filename}`
                })
            } else {
                await EmployeePhoto.create({
                    employee_id: id,
                    filename,
                    avatar: `/avatar/${filename}`
                })
            }

            res.status(201).json({
                message: "Record Saved!",
            });

        }

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};
/**
 * Photo
 */

/**
 * Service Record
 */
exports.GetServiceRecord = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await SalarySchedule.findAll({
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
/**
 * Service Record
 */

/**
 * Face Recognition
 */
exports.CreateBiometric = async (req, res) => {
  const { id } = req.params;
    const { descriptor, imageBase64 } = req.body;
  try {

    const face = await EmployeeFace.findOne({
        where: { employee_id: id }
    });

    if (face) {
        await face.update({
            descriptor: JSON.stringify(descriptor),
            image_file: imageBase64
        }) 
    } else {
        await EmployeeFace.create({
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

        const rows = await EmployeeEducation.findAll({
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
    
    try {
        const educ = Array.isArray(educations) ? educations : [];
        
        const existingRecords = await EmployeeEducation.findAll({
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
                await EmployeeEducation.update({
                    school_level: edu.schoollevel,
                    school_id: edu.schoolId,
                    course_id: edu.courseId,
                    start_date: edu.startDate,
                    end_date: edu.endDate
                }, {
                    where: { 
                        id: edu.id 
                    }
                });
            } else {
                // INSERT new record
                await EmployeeEducation.create({
                    employee_id: id,
                    school_level: edu.schoollevel,
                    school_id: edu.schoolId,
                    course_id: edu.courseId,
                    start_date: edu.startDate,
                    end_date: edu.endDate
                });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await EmployeeEducation.update(
                { 
                    is_active: false 
                },
                { 
                    where: { 
                        id: toDeactivate 
                    }
                }
            );
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
 * Eduaction
 */

/**
 * Training
 */
exports.GetTraining = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await EmployeeTraining.findAll({
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

    try {
        const training = Array.isArray(trainings) ? trainings : [];

        const existingRecords = await EmployeeTraining.findAll({
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
                await EmployeeTraining.update({
                    title: tr.title,
                    type: tr.trainingtype,
                    start_date: tr.startDate,
                    end_date: tr.endDate,
                    hour: tr.hour
                }, {
                    where: { 
                        id: tr.id 
                    }
                });
            } else {
                // INSERT new record
                await EmployeeTraining.create({
                    employee_id: id,
                    title: tr.title,
                    type: tr.trainingtype,
                    start_date: tr.startDate,
                    end_date: tr.endDate,
                    hour: tr.hour
                });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await EmployeeTraining.update(
                { 
                    is_active: false 
                },
                { 
                    where: { 
                        id: toDeactivate 
                    } 
                }
            );
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
 * Training
 */

/**
 * Experience
 */
exports.GetExperience = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await EmployeeExperience.findAll({
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

    try {
        const experience = Array.isArray(experiences) ? experiences : [];

        const existingRecords = await EmployeeExperience.findAll({
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
                await EmployeeExperience.update({
                    position: exp.position,
                    start_date: exp.startDate,
                    end_date: exp.endDate,
                    description: exp.description
                }, {
                    where: { 
                        id: exp.id 
                    }
                });
            } else {
                // INSERT new record
                await EmployeeExperience.create({
                    employee_id: id,
                    position: exp.position,
                    start_date: exp.startDate,
                    end_date: exp.endDate,
                    description: exp.description
                });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await EmployeeExperience.update(
                { 
                    isActive: false 
                },
                { 
                    where: { 
                        id: toDeactivate 
                    }
                }
            );
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
 * Experience
 */

/**
 * Dependent
 */
exports.GetDependent = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await EmployeeDependent.findAll({
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

    try {
        const dependent = Array.isArray(dependents) ? dependents : [];

        const existingRecords = await EmployeeDependent.findAll({
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
                await EmployeeDependent.update({
                    relationship: dep.relationship,
                    first_name: dep.firstname,
                    middle_name: dep.middlename,
                    last_name: dep.lastname,
                    suffix: dep.suffix,
                    birthdate: dep.birthdate,
                    contact_number: dep.contactNo,
                    email: dep.email,
                    address: dep.address,
                    isEmergency: dep.isEmergency
                }, {
                    where: { 
                        id: dep.id 
                    }
                });
            } else {
                // INSERT new record
                await EmployeeDependent.create({
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
                    isEmergency: dep.isEmergency
                });
            }
        }

        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await EmployeeDependent.update(
                { 
                    is_active: false 
                },
                { 
                    where: { 
                        id: toDeactivate 
                    }
                }
            );
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
 * Dependent
 */

/**
 * Document
 */
exports.GetDocument = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await EmployeeDocument.findAll({
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

    const {
        id
    } = req.params;

    const files = req.files || [];

    try {

        for (const file of files) {
            const filePath = `/documents/${file.filename}`;
            await EmployeeDocument.create({
                employee_id: id,
                document: filePath,
                filename: file.originalname
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
 * Document
 */

/**
 * Attendance
 */
exports.GetAttendance = async (req, res) => {

    const { id, year, month } = req.query;

    const m = parseInt(month);
    const y = parseInt(year);

    const startDateMoment = moment(`${year}-${month}-01`, "YYYY-MM-DD").startOf("month");
    const endDateMoment = moment(`${year}-${month}-01`, "YYYY-MM-DD").endOf("month");

    const startDate = startDateMoment.format("YYYY-MM-DD");
    const endDate = endDateMoment.format("YYYY-MM-DD");

    try {

        const rows = await EmployeeAttendance.findAll({
            where: {
                employee_id: id,
                [Op.and]: [
                    { date_start: { [Op.lte]: endDate } }, // attendance starts before or on endDate
                    { date_end: { [Op.gte]: startDate } }  // attendance ends after or on startDate
                ]
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
/**
 * Attendance
 */

/**
 * Leave
 */
exports.GetLeaveBalance = async (req, res) => {

    const id = parseInt(req.query.id);

    try {

        const rows = await EmployeeLeaveBalance.findAll({
            include: [
                {
                    model: LeaveType,
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

        const rows = await EmployeeLeaveApplication.findAll({
            include: [
                {
                    model: LeaveType,
                    as: 'leaveType'
                }
            ],
            where: {
                employee_id: id,
                [Op.and]: [
                    { date_from: { [Op.lte]: endDate } }, // leave starts before or on endOfMonth
                    { date_to: { [Op.gte]: startDate } }  // leave ends after or on startOfMonth
                ]
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
exports.CreateLeave = async (req, res) => {

    const {
        id
    } = req.params;
    
    const {
        leaves
    } = req.body;

    try {

        for (const leave of leaves) {
            await EmployeeLeaveBalance.create({
                employee_id: id,
                leave_type_id: leave.leavetypeid,
                credit: leave.credit,
                earned: leave.earned,
                used: leave.used,
                balance: leave.balance
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