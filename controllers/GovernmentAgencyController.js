const { Op } = require("sequelize");
const { GovernmentAgency } = require('../models');

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

        const { count, rows } = await GovernmentAgency.findAndCountAll({
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
        alias
    } = req.body;

    try {

        const exist = await GovernmentAgency.findOne({
            where: { 
                name 
            }
        });

        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: name,
                    msg: "Record already exists!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        const governmentagency = await GovernmentAgency.create({
            name,
            alias
        });

        res.status(201).json({
            message: "Record Saved!", 
            governmentagency: governmentagency
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
        alias
    } = req.body;

    try {

        const governmentagency = await GovernmentAgency.findByPk(id);
        
        if (!governmentagency) {
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

        const exist = await GovernmentAgency.findOne({
            where: {
                [Op.or]: [
                    { name },
                    { alias }
                ],
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

        await governmentagency.update({ 
            name,
            alias
        });

        res.status(201).json({
            message: "Record Modified!", 
            governmentagency: governmentagency
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

        const governmentagency = await GovernmentAgency.findByPk(id);

        if (!governmentagency) {
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

        await governmentagency.update({ 
            isActive: false
        });

        res.status(200).json({
            message: "Record Disabled!", 
            governmentagency: governmentagency 
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

        const governmentagency = await GovernmentAgency.findByPk(id);

        if (!governmentagency) {
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

        await governmentagency.update({ 
            isActive: true 
        });

        res.status(200).json({
            message: "Record Enabled!.", 
            governmentagency: governmentagency
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};