const { Op, Sequelize, fn, col, literal } = require("sequelize");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const { VacancySignatory, User, Profile } = require('../models');

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {

        const where = {};
        
        if (Filter) {
            where[Op.or] = [
                { firstname: { [Op.like]: `%${Filter}%` } },
                { middlename: { [Op.like]: `%${Filter}%` } },
                { lastname: { [Op.like]: `%${Filter}%` } }
            ];
        }

        const { count, rows } = await VacancySignatory.findAndCountAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: [
                        "username"
                    ],
                    required: true,
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: [
                                "firstname", "middlename", "lastname", "suffix"
                            ],
                            where
                        }
                    ]
                }
            ],
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

const Get = async (id) => {
    return await VacancySignatory.findOne({
        include: [
            {
                model: User,
                as: 'user',
                attributes: [
                    "username"
                ],
                required: true,
                include: [
                    {
                        model: Profile,
                        as: 'profile',
                        attributes: [
                            "firstname", "middlename", "lastname", "suffix"
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
        userId,
        description,
        order
    } = req.body;

    const file = req.file;

    try {

        const exist = await VacancySignatory.findOne({
            where: { 
                userId,
                isActive: true
            }
        });

        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: userId,
                    msg: "Record already exists!",
                    path: "userId",
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

            const signatory = await VacancySignatory.create({
                userId,
                description,
                filename,
                signature: `/signatures/${filename}`,
                order
            });

            const s = await Get(signatory.id);

            res.status(201).json({
                message: "Record Saved!", 
                signatory: s
            });

        }

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Update = async (req, res) => {

    const { id } = req.params;
    const { 
        userId,
        description,
        order
    } = req.body;

    const file = req.file;

    try {

        const signatory = await VacancySignatory.findByPk(id);

        if (!signatory) {
            return res.status(404).json({
                message: 'Record not found.'
            });
        }

        // ❗ Prevent duplicate user assignment (except self)
        const exist = await VacancySignatory.findOne({
            where: { 
                userId,
                isActive: true,
                id: { [Op.ne]: id }
            }
        });

        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: userId,
                    msg: "User already assigned as signatory!",
                    path: "userId",
                    location: "body",
                }],
            });
        }

        let filename = signatory.filename;
        let signature = signatory.signature;

        // ✅ If new signature is uploaded
        if (file) {

            filename = file.originalname;
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

            signature = `/signatures/${filename}`;
        }

        // ✅ Update record
        await signatory.update({
            userId,
            description,
            order,
            filename,
            signature
        });

        const s = await Get(signatory.id);

        res.json({
            message: "Record Updated!",
            signatory: s
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

        const signatory = await VacancySignatory.findByPk(id);

        if (!signatory) {
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

        await signatory.update({ 
            isActive: false
        });

        const s = await Get(signatory.id);

        res.status(200).json({
            message: "Record Disabled!", 
            signatory: s 
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

        const signatory = await VacancySignatory.findByPk(id);

        if (!signatory) {
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

        await signatory.update({ 
            isActive: true 
        });

        const s = await Get(signatory.id);

        res.status(200).json({
            message: "Record Enabled!.", 
            signatory: s
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GetUsers = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                role: {
                    [Op.in]: ['SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance']
                }
            },
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    where: {
                        isEmployee: true
                    }
                }
            ],
            attributes: [
                ['id', 'value'],
                [
                    Sequelize.literal(
                        "CONCAT(`profile`.`firstname`, ' ', `profile`.`middlename`, ' ', `profile`.`lastname`, ' - ', `User`.`role`)"
                    ),
                    'label'
                ]

            ]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}