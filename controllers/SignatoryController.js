const { Op } = require("sequelize");
const { ApprovalSetting } = require('../models');

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

        const { count, rows } = await ApprovalSetting.findAndCountAll({
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
        monthly,
        daily,
        hourly,
        salarytype,
        description,
        qualifications
    } = req.body;

    try {

        const exist = await Position.findOne({
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

        const position = await Position.create({
            name,
            monthly_salary: monthly,
            daily_salary: daily,
            hourly_salary: hourly,
            salary_type : salarytype,
            description,
            qualification: qualifications
        });

        res.status(201).json({
            message: "Record Saved!", 
            data: position
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
        monthly,
        daily,
        hourly,
        salarytype,
        description,
        qualifications
    } = req.body;

    try {
        const position = await Position.findByPk(id);

        if (!position) {
            return res.status(404).json({
                errors: [
                    {
                        type: "field",
                        value: name,
                        msg: "Record not found!",
                        path: "name",
                        location: "body",
                    },
                ],
            });
        }
    
        const exist = await Position.findOne({
            where: {
                [Op.or]: [{ name }],
                id: { [Op.ne]: id },
            },
        });
        if (exist) {
            return res.status(400).json({
                errors: [
                    {
                        type: "manual",
                        value: "",
                        msg: "Record already in use!",
                        path: "name",
                        location: "body",
                    },
                ],
            });
        }
    
        await position.update({ 
            name, 
            monthly_salary: monthly,
            daily_salary: daily,
            hourly_salary: hourly,
            salary_type: salarytype,
            description,
            qualification: qualifications
        });

        return res.status(200).json({
            message: "Record Modified!",
            data: position,
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

        const position = await Position.findByPk(id);

        if (!position) {
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

        await position.update({ 
            is_active: false
        });

        res.status(200).json({
            message: "Record Disabled!", 
            data: position 
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

        const position = await Position.findByPk(id);

        if (!position) {
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

        await position.update({ 
            is_active: true 
        });

        res.status(200).json({
            message: "Record Enabled!.", 
            data: position
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};