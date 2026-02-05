const { Op, fn, col, literal } = require("sequelize");
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

        const { count, rows } = await db.ApprovalSetting.findAndCountAll({
            include: [
                {
                    model: db.User,
                    as: 'owner'
                },
                {
                    model: db.User,
                    as: 'approver'
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

exports.GetUser = async (req, res) => {
    try {
        const data = await db.User.findAll({
            where: {
                status: 'Active'
            },
            attributes: [
                ['id', 'value'],
                [
                    literal(`CONCAT(name, ' (', username, ')')`),
                    'label'
                ],
                ['role', 'role'],
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
        type,
        ownerid,
        signatories
    } = req.body;

    const sign = Array.isArray(signatories)
        ? signatories
        : JSON.parse(signatories || "[]");

    const transaction = await sequelize.transaction();

    try {

        const exist = await db.ApprovalSetting.findOne({
            where: { 
                type,
                owner_id: ownerid,
                is_active: true
            }
        });

        if (exist) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: type,
                    msg: "Record already exists!",
                    path: "type",
                    location: "body",
                }],
            });
        }
        
        await db.ApprovalSetting.bulkCreate(
            sign.map((s) => ({
                type,
                owner_id: ownerid,
                approver_id: s.approverid,
                description: s.description,
                order: s.order,
            })),
            { transaction }
        );

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

exports.Disable = async (req, res) => {

    const { 
        id 
    } = req.params;

    const transaction = await sequelize.transaction();
  
    try {

        const setting = await db.ApprovalSetting.findByPk(id);

        if (!setting) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "type",
                    location: "body",
                }],
            });
        }

        await setting.update({ 
            is_active: false
        }, { transaction });

        const a = await GetApprovalSetting(id);

        await transaction.commit();

        res.status(200).json({
            message: "Record Disabled!", 
            signatory: a 
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

        const setting = await db.ApprovalSetting.findByPk(id);

        if (!setting) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "type",
                    location: "body",
                }],
            });
        }

        await setting.update({ 
            is_active: true 
        }, { transaction });

        const a = await GetApprovalSetting(id);

        await transaction.commit();

        res.status(200).json({
            message: "Record Enabled!.", 
            signatory: a
        });
    } catch (error) {

        await transaction.rollback();
        res.status(500).json({ 
            error: error.message 
        });

    }
};

const GetApprovalSetting = async (id) => {
    return await db.ApprovalSetting.findAndCountAll({
        include: [
            {
                model: db.User,
                as: 'owner'
            },
            {
                model: db.User,
                as: 'approver'
            }
        ],
        where: {
            id
        }
    });
};