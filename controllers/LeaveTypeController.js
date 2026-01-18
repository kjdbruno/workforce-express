const { Op } = require("sequelize");
const { LeaveType } = require('../models');

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

        const { count, rows } = await LeaveType.findAndCountAll({
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

    try {

        const exist = await LeaveType.findOne({
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

        const leavetype = await LeaveType.create({
            code,
            name,
            credit,
            loa_type: loatype,
            annual_limit: annuallimit,
            can_carry_over: cancarryover,
            affects_payroll: affectspayroll
        });

        res.status(201).json({
            message: "Record Saved!", 
            leavetype: leavetype
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
        code,
        name,
        credit,
        loatype,
        annuallimit,
        cancarryover,
        affectspayroll
    } = req.body;

    try {

        const leavetype = await LeaveType.findByPk(id);
        
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

        const exist = await LeaveType.findOne({
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
        });

        res.status(201).json({
            message: "Record Modified!", 
            leavetype: leavetype
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

        const leavetype = await LeaveType.findByPk(id);

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
        });

        res.status(200).json({
            message: "Record Disabled!", 
            leavetype: leavetype 
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

        const leavetype = await LeaveType.findByPk(id);

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
        });

        res.status(200).json({
            message: "Record Enabled!.", 
            leavetype: leavetype
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};