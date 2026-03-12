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

        const { count, rows } = await db.Position.findAndCountAll({
            include: [
                {
                    model: db.Department,
                    as: 'department'
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

exports.GetDepartment = async (req, res) => {
    try {
        const data = await db.Department.findAll({
            where: {
                is_active: true
            },
            attributes: [
                ['id', 'value'],
                ['name', "label"]
            ],
            order: [['id', 'ASC']]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

exports.Create = async (req, res) => {

    const { 
        name,
        departmentId,
        monthly,
        daily,
        hourly,
        salarytype,
        description,
        qualifications,
        benefits
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        // const exist = await db.Position.findOne({
        //     where: { 
        //         name 
        //     }
        // });

        // if (exist) {
        //     return res.status(500).json({
        //         errors: [{
        //             type: "field",
        //             value: name,
        //             msg: "Record already exists!",
        //             path: "name",
        //             location: "body",
        //         }],
        //     });
        // }

        await db.Position.create({
            name,
            department_id: departmentId,
            monthly_salary: monthly,
            daily_salary: daily,
            hourly_salary: hourly,
            salary_type : salarytype,
            description,
            qualification: qualifications,
            benefit: benefits
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
        name,
        departmentId,
        monthly,
        daily,
        hourly,
        salarytype,
        description,
        qualifications,
        benefits
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        const position = await db.Position.findByPk(id);

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
    
        await position.update({ 
            name, 
            department_id: departmentId,
            monthly_salary: monthly,
            daily_salary: daily,
            hourly_salary: hourly,
            salary_type: salarytype,
            description,
            qualification: qualifications,
            benefit: benefits
        },  { transaction });

        await transaction.commit();

        return res.status(200).json({
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
  
    try {

        const position = await db.Position.findByPk(id);

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
        }, { transaction });

        await transaction.commit();

        res.status(200).json({
            message: "Record Disabled!", 
            data: position 
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

        const position = await db.Position.findByPk(id);

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
        }, { transaction });

        await transaction.commit();

        res.status(200).json({
            message: "Record Enabled!.", 
            data: position
        });
    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};