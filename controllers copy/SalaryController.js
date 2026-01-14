const { Op } = require("sequelize");
const { Salary, Position, SalaryClass, Rate, Increment } = require('../models');

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

        const { count, rows } = await Salary.findAndCountAll({
            include: [
                {
                    model: Position,
                    as: 'positions',
                    attributes: [
                        'name'
                    ]
                },
                {
                    model: SalaryClass,
                    as: 'class',
                    attributes: [
                        'name'
                    ]
                },
                {
                model: Rate,
                    as: 'rates',
                    include: [
                        {
                            model: Increment,
                            as: 'increment'
                        }
                    ]
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

const GetSalary = async (id) => {
    return await Salary.findOne({
        where: {
            id
        },
        include: [
            {
                model: Position,
                as: 'positions',
                attributes: [
                    'name'
                ]
            },
            {
                model: SalaryClass,
                as: 'class',
                attributes: [
                    'name'
                ]
            },
            {
                model: Rate,
                as: 'rates',
                include: [
                    {
                        model: Increment,
                        as: 'increment'
                    }
                ]
            }
        ],
    });
};


exports.Create = async (req, res) => {

    const { 
        classId,
        positionId,
        gradeId,
        rates
    } = req.body;

    try {

        const salary = await Salary.create({
            classId,
            positionId,
            gradeId
        });

        if (Array.isArray(rates) && rates.length > 0) {
            const records = rates
                .filter(r => r.monthlyCompensation && !isNaN(parseFloat(r.monthlyCompensation)))
                .filter(r => r.dailyCompensation && !isNaN(parseFloat(r.dailyCompensation)))
                .filter(r => r.hourlyCompensation && !isNaN(parseFloat(r.hourlyCompensation)))
                .map(r => ({
                    salaryId: salary.id,
                    stepId: r.stepId,
                    monthlyCompensation: parseFloat(r.monthlyCompensation),
                    dailyCompensation: parseFloat(r.dailyCompensation),
                    hourlyCompensation: parseFloat(r.hourlyCompensation)
                }));
            if (records.length) {
                await Rate.bulkCreate(records);
            }
        }

        const data = await GetSalary(salary.id);

        res.status(201).json({
            message: "Record Saved!", 
            salary: data
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
        positionId,
        gradeId,
        rates
    } = req.body;

    try {

        const salary = await Salary.findByPk(id, {
            include: [
                { 
                    model: Rate, 
                    as: 'rates' 
                }
            ]
        });
        if (!salary) {
            return res.status(404).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "classId",
                    location: "body",
                }],
            });
        }

        await salary.update({
            positionId,
            classId,
            gradeId
        });

        const incomingRates = Array.isArray(rates) ? rates : [];

        for (const inc of incomingRates) {
            if (!inc.id) continue;

            const existing = salary.rates.find(ri => ri.id === inc.id);

            if (existing) {
                await existing.update({
                    monthlyCompensation: Number(inc.monthlyCompensation),
                    dailyCompensation: Number(inc.dailyCompensation),
                    hourlyCompensation: Number(inc.hourlyCompensation),
                    isActive: true
                });
            }
        }
        
        const data = await GetSalary(salary.id);

        return res.status(200).json({
            message: "Record Modified!",
            salary: data,
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

        const salary = await Salary.findByPk(id);

        if (!salary) {
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

        await salary.update({ 
            isActive: false
        });

        const data = await GetSalary(salary.id);

        res.status(200).json({
            message: "Record Disabled!", 
            salary: data 
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

        const salary = await Salary.findByPk(id);

        if (!salary) {
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

        await salary.update({ 
            isActive: true 
        });

        const data = await GetSalary(salary.id);

        res.status(200).json({
            message: "Record Enabled!.", 
            salary: data
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};