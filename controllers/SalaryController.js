const { Op, Sequelize } = require("sequelize");

const db = require('../models');
const { sequelize } = db;

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');

const pug = require('pug');
const puppeteer = require('puppeteer');

exports.GetPosition = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {
        const where = {
            status: 'Vacant',
            is_active: true
        };

        if (Filter) {
            where.name = { [Op.like]: `%${Filter}%` };
        }

        const { count, rows } = await db.Position.findAndCountAll({
            attributes: [
                'id',
                ['id', 'value'],
                ['name', 'label'],
                'description',
                'qualification',
                'salary_type',
                'status',
                // Dynamic salary range based on salary_type
                [
                    Sequelize.literal(`
                        CASE salary_type
                        WHEN 'Monthly' THEN FORMAT(monthly_salary, 2)
                        WHEN 'Daily' THEN FORMAT(daily_salary, 2)
                        WHEN 'Hourly' THEN FORMAT(hourly_salary, 2)
                        ELSE NULL
                        END
                    `),
                    'amount'
                ]
            ],
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

exports.RemoveSalary = async (req, res) => {

    const { 
        salaryId 
    } = req.body;

    const id = salaryId;
    
    try {

        const salary = await db.SalarySchedule.findByPk(id);

        if (!salary) {
            return res.status(404).json({
                error: 'Salary record not found'
            });
        }

        // Set end_date to today and deactivate
        await salary.update({
            end_date: new Date(),
            is_active: false
        });

        res.json({
            message: 'Record Updated!'
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.GenerateServicePDF = async (req, res) => {
    const { 
        id
    } = req.params;
    let browser;
    try {

        const employee = await db.Employee.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: db.Employment,
                    as: 'employment',
                    attributes: [
                        'employment_status',
                        'date_hired'
                    ],
                    include: [
                        {
                            model: db.Position,
                            as: 'position',
                            attributes: [
                                'name'
                            ]
                        }
                    ]
                },
                {
                    model: db.SalarySchedule,
                    as: 'salarySchedules',
                    attributes: [
                        'amount',
                        'salary_type',
                        'salary_group',
                        'employment_status',
                        'effective_date',
                        'end_date'
                    ],
                    include: [
                        {
                            model: db.Position,
                            as: 'position',
                            attributes: [
                                'name'
                            ]
                        }
                    ]

                }
            ]
        });

        const sortedSalaries = employee.salarySchedules.sort((a, b) => {
            // Put active (Present) first
            if (!a.end_date && b.end_date) return -1;
            if (a.end_date && !b.end_date) return 1;

            // If both active or both inactive → latest first
            return new Date(b.effective_date) - new Date(a.effective_date);
        });

        const result = sortedSalaries.map(salary => ({
            position: salary?.position?.name || null,
            salary: salary.amount,
            employment_status: salary?.employment_status,
            start_date: salary.effective_date,
            end_date: salary.end_date,
            salary_type: salary.salary_type,
            salary_group: salary.salary_group,
            notes: salary.notes
        }));

        const fullName = [
            employee.first_name,
            employee.middle_name,
            employee.last_name
        ].filter(Boolean).join(' ');

        // Get position safely
        const position = employee.employment?.position?.name || 'N/A';

        const templatePath = path.join(__dirname, '../templates/reports/ServiceRecord.pug');

        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const html = pug.renderFile(templatePath, { 
            seal, 
            services: result,
            name: fullName,
            position,
            moment
        });
        const browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
    
        await page.setContent(html, { waitUntil: 'networkidle0' });

        await page.emulateMediaType('print');

        const width = '8.5in'
        const height = '11in'
    
        const pdfBuffer = await page.pdf({
            width: width, 
            height: height, 
            landscape: true, 
            margin: {
                top: '25px',
                bottom: '25px',
                left: '25px',
                right: '25px'
            }, 
            preferCSSPageSize: true,
            printBackground: true
        });

        const buffer = Buffer.from(pdfBuffer);
        res.send(buffer)

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

