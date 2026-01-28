const { Op } = require("sequelize");
const db = require('../models');
const { sequelize } = db;

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

        const { count, rows } = await db.Shift.findAndCountAll({
            include: [
                {
                    model: db.ShiftDay,
                    as: 'days'
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

exports.Create = async (req, res) => {

    const { 
        code,
        name,
        starttime,
        endtime,
        breakminutes,
        graceminutes,
        earliestminutes,
        latestminutes,
        crossesmidnight,
        days
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        const exist = await db.Shift.findOne({
            where: { 
                code, name 
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

        const shift = await db.Shift.create({
            code,
            name,
            start_time: starttime,
            end_time: endtime,
            break_minutes: breakminutes,
            grace_minutes: graceminutes,
            earliest_minutes: earliestminutes,
            latest_minutes: latestminutes,
            crosses_midnight: crossesmidnight
        }, { transaction });

        const sd = days.map(day => ({
            shift_id: shift.id,
            day_of_week: day
        }));
        await db.ShiftDay.bulkCreate(sd, { transaction });

        const s = await GetShift(shift.id);

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!", 
            shift: s
        });

    } catch (error) {

        await transaction.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Update = async (req, res) => {

    const { 
        id 
    } = req.params;

    const transaction = await sequelize.transaction();

    const { 
        code,
        name,
        starttime,
        endtime,
        breakminutes,
        graceminutes,
        earliestminutes,
        latestminutes,
        crossesmidnight,
        days
    } = req.body;

    try {

        await db.ShiftDay.destroy({
            where: { 
                shift_id: id 
            },
            transaction
        });

        const shift = await db.Shift.findByPk(id);
        
        if (!shift) {
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

        const exist = await db.Shift.findOne({
            where: {
                [Op.or]: [{ code }, { name }],
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

        await shift.update({ 
            code,
            name,
            start_time: starttime,
            end_time: endtime,
            break_minutes: breakminutes,
            grace_minutes: graceminutes,
            earliest_minutes: earliestminutes,
            latest_minutes: latestminutes,
            crosses_midnight: crossesmidnight
        }, { transaction });

        const sd = days.map(day => ({
            shift_id: id,
            day_of_week: day
        }));
        await db.ShiftDay.bulkCreate(sd, { transaction });

        const s = await GetShift(id);

        await transaction.commit();

        res.status(201).json({
            message: "Record Modified!", 
            shift: s
        });

    } catch (error) {

        await transaction.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

const GetShift = async (id) => {

    return await db.Shift.findOne({
        include: [
            {
                model: db.ShiftDay,
                as: 'days'
            }
        ],
        where: {
            id
        }
    });

};