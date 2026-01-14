const { Op } = require("sequelize");
const { Holiday, PremiumPay } = require('../models');

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

        const { count, rows } = await Holiday.findAndCountAll({
            include: [
                {
                    model: PremiumPay,
                    as: 'premiumPay'
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

Get = async (id) => {

    const row = await Holiday.findOne({
        include: [
            {
                model: PremiumPay,
                as: 'premiumPay'
            }
        ],
        where: {
            id
        }
    });

    return row;

};

exports.Create = async (req, res) => {

    const { 
        name,
        date,
        payId
    } = req.body;

    try {

        const exist = await Holiday.findOne({
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

        const holiday = await Holiday.create({
            name,
            date,
            payId
        });

        const h = await Get(holiday.id);

        res.status(201).json({
            message: "Record Saved!", 
            holiday: h
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
        date,
        payId
    } = req.body;

    try {

        const holiday = await Holiday.findByPk(id);
        
        if (!holiday) {
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

        const exist = await Holiday.findOne({
            where: {
                name,
                date,
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

        await holiday.update({ 
            name,
            date,
            payId
        });

        const h = await Get(holiday.id);

        res.status(201).json({
            message: "Record Modified!", 
            holiday: h
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

        const holiday = await Holiday.findByPk(id);

        if (!holiday) {
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

        await holiday.update({ 
            isActive: false
        });

        const h = await Get(holiday.id);

        res.status(200).json({
            message: "Record Disabled!", 
            holiday: h 
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

        const holiday = await Holiday.findByPk(id);

        if (!holiday) {
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

        await holiday.update({ 
            isActive: true 
        });

        const h = await Get(holiday.id);

        res.status(200).json({
            message: "Record Enabled!.", 
            holiday: h
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};