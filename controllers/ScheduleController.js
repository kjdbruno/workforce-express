const { Op } = require("sequelize");
const { Schedule } = require('../models');

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

        const { count, rows } = await Schedule.findAndCountAll({
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
        timeStart,
        timeEnd
    } = req.body;

    try {

        const exist = await Schedule.findOne({
            where: { 
                name,
                time_start: timeStart,
                time_end: timeEnd
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

        const schedule = await Schedule.create({
            name,
            time_start: timeStart,
            time_end: timeEnd
        });

        res.status(201).json({
            message: "Record Saved!", 
            schedule: schedule
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
        timeStart,
        timeEnd
    } = req.body;

    try {

        const schedule = await Schedule.findByPk(id);
        
        if (!schedule) {
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

        const exist = await Schedule.findOne({
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
                    type: "field",
                    value: name,
                    msg: "Record already in use!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        await schedule.update({ 
            name,
            time_start: timeStart,
            time_end: timeEnd
        });

        res.status(201).json({
            message: "Record Modified!", 
            schedule: schedule
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

        const schedule = await Schedule.findByPk(id);

        if (!schedule) {
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

        await schedule.update({ 
            is_active: false
        });

        res.status(200).json({
            message: "Record Disabled!", 
            schedule: s 
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

        const schedule = await Schedule.findByPk(id);

        if (!schedule) {
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

        await schedule.update({ 
            is_active: true 
        });

        res.status(200).json({
            message: "Record Enabled!.", 
            schedule: s
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};