const { Op, Sequelize, literal } = require("sequelize");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');

const pug = require('pug');
const puppeteer = require('puppeteer');
const { Employee, Employment, Position, Applicant, Vacancy, Company, Department, Schedule, Course, School, ApplicantEducation, ApplicantExperience, ApplicantTraining, ApplicantDocument, PayrollGroup, SalarySchedule, EmployeeEducation, EmployeeTraining, EmployeeExperience, EmployeeDocument } = require("../models");

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
                ['name', "label"],
                'amount',
                'description',
                'qualification',
                'status'
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
exports.GetPayrollGroup = async (req, res) => {
    try {
        const data = await PayrollGroup.findAll({
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
        salarytype,
        salarygroup,
        payrollgroupId,
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
            payroll_group_id: payrollgroupId
        });

        const position = await Position.findByPk(positionId)
        await position.update({
            status: 'Filled'
        })
        const salary = await SalarySchedule.create({
            employee_id: employee.id,
            amount: position.amount,
            salary_type: salarytype,
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

        res.status(201).json({
            message: "Record Saved!"
        });

    } catch (error) {
        console.log(error)
        res.status(400).json({ 
            error: error.message 
        });

    }
};