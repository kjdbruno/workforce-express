const { Op } = require("sequelize");
const { Position, PositionQualification, SalaryGrade, Salary } = require('../models');

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

        const { count, rows } = await Position.findAndCountAll({
            include: [
                {
                    model: PositionQualification,
                    as: 'qualifications',
                    where: {
                        isActive: true
                    },
                    required: false
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

const Get = async (id) => {
    return await Position.findOne({
        where: {
            id
        },
        include: [
            {
                model: Salary,
                as: 'salary',
                include: [
                    {
                        model: SalaryGrade,
                        as: 'grade'
                    }
                ]
            },
            {
                model: PositionQualification,
                as: 'qualifications',
                where: {
                    isActive: true
                },
                required: false
            }
        ],
    });
};


exports.Create = async (req, res) => {

    const { 
        salaryId,
        name,
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
            salaryId,
            name,
            description
        });

        if (Array.isArray(qualifications) && qualifications.length > 0) {
            const records = qualifications
                .filter(q => q.name && q.name.trim())
                .map(q => ({
                    positionId: position.id,
                    name: q.name
                }));
            if (records.length) {
                await PositionQualification.bulkCreate(records);
            }
        }

        const p = await Get(position.id);

        res.status(201).json({
            message: "Record Saved!", 
            position: p
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
        salaryId,
        name,
        description,
        qualifications
    } = req.body;

    try {
    const position = await Position.findByPk(id, {
        include: [
                { 
                model: PositionQualification, 
                as: "qualifications" 
            }
        ],
    });

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
        salaryId,
        name, 
        description 
    });
    
    const incoming = (qualifications || []).filter(
        (q) => q.name && q.name.trim()
    );

    const existingQualifications = await PositionQualification.findAll({
        where: { 
            positionId: id 
        },
    });

    const existingMap = new Map(
      existingQualifications.map((eq) => [eq.id, eq])
    );
    const processedIds = new Set();

    for (const q of incoming) {
        if (q.id && existingMap.has(q.id)) {
            const existing = existingMap.get(q.id);
            existing.name = q.name.trim();
            existing.isActive = true;
            await existing.save();
            processedIds.add(q.id);
        } else {
            await PositionQualification.create({
                positionId: id,
                name: q.name.trim(),
                isActive: true,
            });
        }
    }
    
    for (const qual of existingQualifications) {
        if (!processedIds.has(qual.id)) {
            qual.isActive = false;
            await qual.save();
        }
    }
    
    const data = await Get(position.id);

    return res.status(200).json({
        message: "Record Modified!",
        position: data,
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
            isActive: false
        });

        res.status(200).json({
            message: "Record Disabled!", 
            position: position 
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
            isActive: true 
        });

        res.status(200).json({
            message: "Record Enabled!.", 
            position: position
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};