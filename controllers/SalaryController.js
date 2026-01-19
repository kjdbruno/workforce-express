const { Op, Sequelize } = require("sequelize");
const { SalarySchedule, Employee, Employment, Position, PayrollGroup } = require('../models');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');

const pug = require('pug');
const puppeteer = require('puppeteer');

exports.GetPosition = async (req, res) => {
    try {
        const data = await Position.findAll({
            where: {
                is_active: true
            },
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
            order: [['id', 'ASC']]
        });

        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};
exports.GetPayrollGroup = async (req, res) => {
    try {
        const data = await PayrollGroup.findAll({
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

exports.GenerateServicePDF = async (req, res) => {
    const { 
        id
    } = req.params;
    let browser;
    try {

        const employee = await Employee.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: Employment,
                    as: 'employment',
                    include: [
                        {
                            model: Position,
                            as: 'position',
                            attributes: ['name'] // or position_title if that's your column
                        }
                    ],
                    attributes: [
                        'employment_status',
                        'date_hired'
                    ]
                },
                {
                    model: SalarySchedule,
                    as: 'salarySchedules',
                    attributes: [
                        'amount',
                        'salary_type',
                        'salary_group',
                        'effective_date',
                        'end_date'
                    ],
                    order: [['effective_date', 'DESC']]
                }
            ]
        });

        const result = employee.salarySchedules.map(salary => ({
            position: employee.employment?.position?.name || null,
            salary: salary.amount,
            employment_status: employee.employment?.employment_status,
            start_date: salary.effective_date,
            end_date: salary.end_date,
            salary_type: salary.salary_type,
            salary_group: salary.salary_group,
            notes: salary.notes
        }));



        const templatePath = path.join(__dirname, '../templates/reports/ServiceRecord.pug');

        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const html = pug.renderFile(templatePath, { 
            seal, 
            services: result,
            moment
        });
        const browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
    
        await page.setContent(html, { waitUntil: 'networkidle0' });

        await page.emulateMediaType('print');
``
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

