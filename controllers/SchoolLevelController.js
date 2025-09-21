const { Op } = require("sequelize");
const { SchoolLevel } = require('../models');

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

        const { count, rows } = await SchoolLevel.findAndCountAll({
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

exports.Create = async (req, res) => {

    const { 
        name,
        description
    } = req.body;

    try {

        const exist = await SchoolLevel.findOne({
            where: { 
                name 
            }
        });

        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "manual",
                    value: "",
                    msg: "Record already exists!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        const schoollevel = await SchoolLevel.create({
            name,
            description
        });

        res.status(201).json({
            message: "Record Saved!", 
            schoollevel: schoollevel
        });

    } catch (error) {

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

        const schoollevel = await SchoolLevel.findByPk(id);
        
        if (!schoollevel) {
            return res.status(500).json({
                errors: [{
                    type: "manual",
                    value: "",
                    msg: "Record not found!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        const exist = await SchoolLevel.findOne({
            where: {
                [Op.or]: [
                    { name }
                ],
                id: { [Op.ne]: id }
            },
        });
        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "manual",
                    value: "",
                    msg: "Record already in use!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        await schoollevel.update({ 
            name,
            description
        });

        res.status(201).json({
            message: "Record Modified!", 
            schoollevel: schoollevel
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

        const schoollevel = await SchoolLevel.findByPk(id);

        if (!schoollevel) {
            return res.status(500).json({
                errors: [{
                    type: "manual",
                    value: "",
                    msg: "Record not found!",
                    path: "",
                    location: "body",
                }],
            });
        }

        await schoollevel.update({ 
            isActive: false
        });

        res.status(200).json({
            message: "Record Disabled!", 
            schoollevel: schoollevel 
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

        const schoollevel = await SchoolLevel.findByPk(id);

        if (!schoollevel) {
            return res.status(500).json({
                errors: [{
                    type: "manual",
                    value: "",
                    msg: "Record not found!",
                    path: "",
                    location: "body",
                }],
            });
        }

        await schoollevel.update({ 
            isActive: true 
        });

        res.status(200).json({
            message: "Record Enabled!.", 
            schoollevel: schoollevel
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};