const { Op } = require("sequelize");
const { Signatory, User, Profile, SignatoryType } = require('../models');
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
            where[Op.or] = [
                { firstname: { [Op.like]: `%${Filter}%` } },
                { middlename: { [Op.like]: `%${Filter}%` } },
                { lastname: { [Op.like]: `%${Filter}%` } }
            ];
        }

        const { count, rows } = await Signatory.findAndCountAll({
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
                },
                {
                    model: SignatoryType,
                    as: 'type',
                    attributes: [
                        "name"
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

Get = async (id) => {

    const rows  = await Signatory.findOne({
        include: [
            {
                model: User,
                as: 'user',
                attributes: [
                    "username"
                ],
                include: [
                    {
                        model: Profile,
                        as: 'profile',
                        attributes: [
                            "firstname", "middlename", "lastname", "suffix"
                        ]
                    }
                ]
            },
            {
                model: SignatoryType,
                as: 'type',
                attributes: [
                    "name"
                ]
            }
        ],
        where: {
            id
        }
    });

    return rows;

};

exports.Create = async (req, res) => {

    const { 
        userId,
        typeId,
        order
    } = req.body;

    const file = req.file;

    try {

        const exist = await Signatory.findOne({
            where: { 
                userId,
                typeId,
                order
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

            const signatory = await Signatory.create({
                userId,
                typeId,
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

        const signatory = await Signatory.findByPk(id);

        if (!signatory) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "userId",
                    location: "body",
                }],
            });
        }

        await signatory.update({ 
            isActive: false
        });

        const data = await Get(signatory.id);

        res.status(200).json({
            message: "Record Disabled!", 
            signatory: data 
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

        const signatory = await Signatory.findByPk(id);

        if (!signatory) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "userId",
                    location: "body",
                }],
            });
        }

        await signatory.update({ 
            isActive: true 
        });

        const data = await Get(signatory.id);

        res.status(200).json({
            message: "Record Enabled!.", 
            signatory: data
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};