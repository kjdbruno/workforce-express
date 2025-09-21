const { Op } = require("sequelize");
const { Salary, SalaryClass, SalaryGrade, Rate, Increment } = require('../models');

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
                    model: SalaryClass,
                    as: 'class',
                },
                {
                    model: SalaryGrade,
                    as: 'grade'
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

GetRate = async (id) => {

    const rows  = await Salary.findOne({
        where: {
            id
        },
        include: [
            {
                model: SalaryClass,
                as: 'class',
            },
            {
                model: SalaryGrade,
                as: 'grade'
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

    return rows;

};

exports.Create = async (req, res) => {

    const { 
        classId,
        gradeId,
        rates
    } = req.body;

    try {

        const salary = await Salary.create({
            classId,
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

        const data = await GetRate(salary.id);

        res.status(201).json({
            message: "Record Saved!", 
            rate: data
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
    } = req.params; // rateId
    const { 
        classId, 
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
                    type: "manual",
                    value: "",
                    msg: "Record not found!",
                    path: "rateId",
                    location: "body",
                }],
            });
        }

        await salary.update({
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
        
        const data = await GetRate(salary.id);

        res.status(200).json({
            message: "Record Modified!",
            rate: data
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
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
                    type: "manual",
                    value: "",
                    msg: "Record not found!",
                    path: "",
                    location: "body",
                }],
            });
        }

        await salary.update({ 
            isActive: false
        });

        const data = await GetRate(salary.id);

        res.status(200).json({
            message: "Record Disabled!", 
            rate: data 
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
                    type: "manual",
                    value: "",
                    msg: "Record not found!",
                    path: "",
                    location: "body",
                }],
            });
        }

        await salary.update({ 
            isActive: true 
        });

        const data = await GetRate(salary.id);

        res.status(200).json({
            message: "Record Enabled!.", 
            rate: data
        });
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};