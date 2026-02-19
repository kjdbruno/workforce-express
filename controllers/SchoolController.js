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

        const { count, rows } = await db.School.findAndCountAll({
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
        type,
        website,
        contactNo
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        const exist = await db.School.findOne({
            where: {
                [Op.or]: [
                    { name }
                ]
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

        const school = await db.School.create({
            name,
            type,
            website,
            contactNo
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!", 
            school: school
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
        type,
        website,
        contactNo
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        const school = await db.School.findByPk(id);
        
        if (!school) {
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

        const exist = await db.School.findOne({
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

        await school.update({ 
            name,
            type,
            website,
            contactNo
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: "Record Modified!", 
            school: school
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

        const school = await db.School.findByPk(id);

        if (!school) {
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

        await school.update({ 
            isActive: false
        }, { transaction });

        await transaction.commit();

        res.status(200).json({
            message: "Record Disabled!", 
            school: school 
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

        const school = await db.School.findByPk(id);

        if (!school) {
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

        await school.update({ 
            isActive: true 
        }, { transaction });

        await transaction.commit();

        res.status(200).json({
            message: "Record Enabled!.", 
            school: school
        });
    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};