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

        const { count, rows } = await db.LeaveType.findAndCountAll({
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
        credit,
        loatype,
        annuallimit,
        cancarryover,
        affectspayroll
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        const exist = await db.LeaveType.findOne({
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

        await db.LeaveType.create({
            code,
            name,
            credit,
            loa_type: loatype,
            annual_limit: annuallimit,
            can_carry_over: cancarryover,
            affects_payroll: affectspayroll
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!"
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

    const { 
        code,
        name,
        credit,
        loatype,
        annuallimit,
        cancarryover,
        affectspayroll
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        const leavetype = await db.LeaveType.findByPk(id);
        
        if (!leavetype) {
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

        const exist = await db.LeaveType.findOne({
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

        await leavetype.update({ 
            code,
            name,
            credit,
            loa_type: loatype,
            annual_limit: annuallimit,
            can_carry_over: cancarryover,
            affects_payroll: affectspayroll
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: "Record Modified!"
        });

    } catch (error) {

        await transaction.rollback();
        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Disable = async (req, res) => {

    const { 
        id 
    } = req.params;

    const transaction = await sequelize.transaction();
  
    try {

        const leavetype = await db.LeaveType.findByPk(id);

        if (!leavetype) {
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

        await leavetype.update({ 
            is_active: false
        }, { transaction });

        await transaction.commit();

        res.status(200).json({
            message: "Record Disabled!", 
            leavetype: leavetype 
        });

    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.Enable = async (req, res) => {

    const { 
        id 
    } = req.params;

    const transaction = await sequelize.transaction();
  
    try {

        const leavetype = await db.LeaveType.findByPk(id);

        if (!leavetype) {
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

        await leavetype.update({ 
            is_active: true 
        }, { transaction });

        await transaction.commit();

        res.status(200).json({
            message: "Record Enabled!.", 
            leavetype: leavetype
        });
    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};