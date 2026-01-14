const { Op } = require("sequelize");
const { ScheduleShift, ScheduleClass } = require('../models');

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

        const { count, rows } = await ScheduleShift.findAndCountAll({
            include: [
                {
                    model: ScheduleClass,
                    as: 'class'
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

    const row = await ScheduleShift.findOne({
        where: {
            id
        },
        include: [
            {
                model: ScheduleClass,
                as: 'class',
                required: false
            }
        ],
    });

    return row;

};

exports.Create = async (req, res) => {

    const { 
        classId,
        timeStart,
        timeEnd
    } = req.body;

    try {

        const exist = await ScheduleShift.findOne({
            where: { 
                classId
            }
        });

        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: classId,
                    msg: "Record already exists!",
                    path: "classId",
                    location: "body",
                }],
            });
        }

        const scheduleshift = await ScheduleShift.create({
            classId,
            timeStart,
            timeEnd
        });

        const s = await Get(scheduleshift.id);

        res.status(201).json({
            message: "Record Saved!", 
            scheduleshift: s
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
        classId,
        timeStart,
        timeEnd
    } = req.body;

    try {

        const scheduleshift = await ScheduleShift.findByPk(id);
        
        if (!scheduleshift) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: classId,
                    msg: "Record not found!",
                    path: "classId",
                    location: "body",
                }],
            });
        }

        const exist = await ScheduleShift.findOne({
            where: {
                [Op.or]: [
                    { classId }
                ],
                id: { [Op.ne]: id }
            },
        });
        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: classId,
                    msg: "Record already in use!",
                    path: "classId",
                    location: "body",
                }],
            });
        }

        await scheduleshift.update({ 
            classId,
            timeStart,
            timeEnd
        });

        const s = await Get(scheduleshift.id);

        res.status(201).json({
            message: "Record Modified!", 
            scheduleshift: s
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

        const scheduleshift = await ScheduleShift.findByPk(id);

        if (!scheduleshift) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "classId",
                    location: "body",
                }],
            });
        }

        await scheduleshift.update({ 
            isActive: false
        });

        const s = await Get(scheduleshift.id);

        res.status(200).json({
            message: "Record Disabled!", 
            scheduleshift: s 
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

        const scheduleshift = await ScheduleShift.findByPk(id);

        if (!scheduleshift) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "classId",
                    location: "body",
                }],
            });
        }

        await scheduleshift.update({ 
            isActive: true 
        });

        const s = await Get(scheduleshift.id);

        res.status(200).json({
            message: "Record Enabled!.", 
            scheduleshift: s
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};