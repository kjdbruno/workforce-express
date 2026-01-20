const { Op, fn, col, literal } = require("sequelize");
const { ApprovalSetting, User } = require('../models');

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

        const where = {};

        if (Filter) {
            where.name = { [Op.like]: `%${Filter}%` };
        }

        const { count, rows } = await ApprovalSetting.findAndCountAll({
            include: [
                {
                    model: User,
                    as: 'owner'
                },
                {
                    model: User,
                    as: 'approver'
                }
            ],
            where,
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

exports.GetUser = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                status: 'Active',
                role: {
                    [Op.ne]: 'Employee' // NOT Employee
                }
            },
            attributes: [
                ['id', 'value'],
                [
                    literal(`CONCAT(name, ' (', username, ')')`),
                    'label'
                ],
                ['role', 'role'],
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
        type,
        ownerid,
        approverid,
        description,
        order
    } = req.body;

    const file = req.file;

    try {

        const exist = await ApprovalSetting.findOne({
            where: { 
                type,
                owner_id: ownerid,
                approver_id: approverid 
            }
        });

        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: type,
                    msg: "Record already exists!",
                    path: "type",
                    location: "body",
                }],
            });
        }

        if (file) {
            const filename = file.originalname;
            const ext = path.extname(file.originalname).toLowerCase();
            const uploadPath = path.join(__dirname, '../public/signatures', filename);

            let sharpPipeline = sharp(file.buffer).resize({ width: 800 });

            if (ext === '.png') {
                sharpPipeline = sharpPipeline.png({ quality: 80 });
            } else {
                sharpPipeline = sharpPipeline
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: 80 });
            }

            await sharpPipeline.toFile(uploadPath);

            const signatory = await ApprovalSetting.create({
                type,
                owner_id: ownerid,
                approver_id: approverid,
                description,
                signature: `/signatures/${filename}`,
                order
            });

            res.status(201).json({
                message: "Record Saved!", 
                signatory: signatory
            });

        }

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

        const setting = await ApprovalSetting.findByPk(id);

        if (!setting) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "type",
                    location: "body",
                }],
            });
        }

        await setting.update({ 
            is_active: false
        });

        res.status(200).json({
            message: "Record Disabled!", 
            signatory: setting 
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

        const setting = await ApprovalSetting.findByPk(id);

        if (!setting) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "type",
                    location: "body",
                }],
            });
        }

        await setting.update({ 
            is_active: true 
        });

        res.status(200).json({
            message: "Record Enabled!.", 
            signatory: setting
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};