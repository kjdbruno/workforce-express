const { Op } = require("sequelize");
const { SignatoryType } = require('../models');

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

        const { count, rows } = await SignatoryType.findAndCountAll({
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
        name
    } = req.body;

    try {

        const exist = await SignatoryType.findOne({
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

        const signatorytype = await SignatoryType.create({
            name
        });

        res.status(201).json({
            message: "Record Saved!", 
            signatorytype: signatorytype
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
        name
    } = req.body;

    try {

        const signatorytype = await SignatoryType.findByPk(id);
        
        if (!signatorytype) {
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

        const exist = await SignatoryType.findOne({
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

        await signatorytype.update({ 
            name
        });

        res.status(201).json({
            message: "Record Modified!", 
            signatorytype: signatorytype
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

        const signatorytype = await SignatoryType.findByPk(id);

        if (!signatorytype) {
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

        await signatorytype.update({ 
            isActive: false
        });

        res.status(200).json({
            message: "Record Disabled!", 
            signatorytype: signatorytype 
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

        const signatorytype = await SignatoryType.findByPk(id);

        if (!signatorytype) {
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

        await signatorytype.update({ 
            isActive: true 
        });

        res.status(200).json({
            message: "Record Enabled!.", 
            signatorytype: signatorytype
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};