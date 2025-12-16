const { Op } = require("sequelize");
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
    AppointmentStatus
} = require('../models');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

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
                    model: Position,
                    as: 'position',
                    attributes: [
                        'name'
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

exports.GetEmployment = async (req, res) => {

    const { 
        id 
    } = req.query;
    try {

        const rows = await EmploymentInformation.findOne({
            where: {
                id
            },
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    include: [
                        {
                            model: ProfileContactInformation,
                            as: 'contactInformations',
                            attributes: [
                                'email', 'contactNo'
                            ]
                        }
                    ]
                }
            ]
        })

        res.json({
            data: rows.profile
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
        positionId,
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
                isEmployee: true
            }, { transaction: t });
            await ProfileContactInformation.create({
                profileId: profile.id,
                email,
                contactNo
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
            positionId,
            employmentId,
            appointmentId
        }, { transaction: t });
        await EmploymentSchedule.create({
            profileId: employee.id,
            shiftId
        }, { transaction: t });
        await EmploymentHistory.create({
            profileId: employee.id,
            positionId,
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
        if (file) {
            const filename = file.originalname;
            const ext = path.extname(file.originalname).toLowerCase();
            const uploadPath = path.join(__dirname, '../public/uploads/photos', filename);

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
                photo: `/photos/${filename}`
            }, { transaction: t });
        }

        await t.commit();

        const data = await GetEmp(employmentInfo.id);

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

exports.Update = async (req, res) => {

    const { 
        id 
    } = req.params;

    const { 
        name,
        description
    } = req.body;

    try {

        const appointmentstatus = await AppointmentStatus.findByPk(id);
        
        if (!appointmentstatus) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: name,
                    msg: "Record not found!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        const exist = await AppointmentStatus.findOne({
            where: {
                [Op.or]: [{ name }],
                id: { [Op.ne]: id }
            },
        });
        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: name,
                    msg: "Record already in use!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        await appointmentstatus.update({ 
            name,
            description
        });

        res.status(201).json({
            message: "Record Modified!", 
            appointmentstatus: appointmentstatus
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

        const appointmentstatus = await AppointmentStatus.findByPk(id);

        if (!appointmentstatus) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        await appointmentstatus.update({ 
            isActive: false
        });

        res.status(200).json({
            message: "Record Disabled!", 
            appointmentstatus: appointmentstatus 
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

        const appointmentstatus = await AppointmentStatus.findByPk(id);

        if (!appointmentstatus) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        await appointmentstatus.update({ 
            isActive: true 
        });

        res.status(200).json({
            message: "Record Enabled!.", 
            appointmentstatus: appointmentstatus
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};