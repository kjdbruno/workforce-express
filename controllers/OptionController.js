const { Op, Sequelize, fn, col, literal } = require("sequelize");
const { Sex, Role, Profile, Department, Increment, Position, ScheduleClass, PremiumPay, SalaryClass, SalaryGrade, Salary, Rate, Company, ScheduleShift, EmploymentStatus, SchoolLevel } = require('../models');
const role = require("../models/role");

exports.GetOptions = async (req, res) => {

    const positionId = req.query.positionId || '';

    try {

        const roles = await Role.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        });

        const employees = await Profile.findAll({
            attributes: [
                ['id', 'value'],
                [Sequelize.fn('CONCAT', Sequelize.col('firstname'), ' ', Sequelize.col('middlename'), ' ',Sequelize.col('lastname'), ' ', Sequelize.col('suffix')), 'name']
            ]
        });

        const departments = await Department.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        }); 

        const positions = await Position.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        }); 

        const scheduleclasses = await ScheduleClass.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        }); 

        const premiumpays = await PremiumPay.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        }); 

        const salaryclasses = await SalaryClass.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        }); 

        const salarygrades = await SalaryGrade.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        }); 

        const increments = await Increment.findAll({
            order: [['id', 'ASC']],
            attributes: [
                ['id', 'value'],
                ['name', 'label'],
                ['id', 'stepId'],
                [literal('NULL'), 'id'],
                [literal('NULL'), 'monthlyCompensation'],
                [literal('NULL'), 'dailyCompensation'],
                [literal('NULL'), 'hourlyCompensation']
            ]
        }); 

        const salaries = await Salary.findAll({
            include: [
                {
                    model: SalaryClass,
                    as: 'class',
                    attributes: []
                },
                {
                    model: SalaryGrade,
                    as: 'grade',
                    attributes: []
                }
            ],
            attributes: [
                ['id', 'value'],
                [
                    Sequelize.literal("CONCAT(`class`.`name`, ' - ', `grade`.`name`)"),
                    'label'
                ]
            ]
        }); 

        const recruitmentSteps = await Position.findAll({
            where: {
                id: positionId
            },
            include: [
                {
                    model: Salary,
                    as: 'salary',
                    required: true, // INNER JOIN
                    include: [
                        {
                            model: Rate,
                            as: 'rates',
                            required: true, // INNER JOIN
                            include: [
                                {
                                model: Increment,
                                as: 'increment',
                                required: true
                                }
                            ]
                        },
                        {
                            model: SalaryClass,
                            as: 'class',
                            required: true
                        }
                    ]
                }
            ],
            attributes: [
                ['id', 'value'], // Position.id as value
                [Sequelize.col('salary->rates->increment.name'), 'label'], // increment.name as label
                [Sequelize.col('salary->class.name'), 'class'], // SalaryClass.name
                [Sequelize.col('salary->rates.monthlyCompensation'), 'monthly'],
                [Sequelize.col('salary->rates.dailyCompensation'), 'daily'],
                [Sequelize.col('salary->rates.hourlyCompensation'), 'hourly']
            ],
            raw: true,
            nest: true
        });


        // const recruitmentSteps = await Position.findAll({
        //     include: [
        //         {
        //             model: Salary,
        //             as: 'salary',
        //             include: [
        //                 {
        //                     model: Rate,
        //                     as: 'rates',
        //                     include: [
        //                         {
        //                             model: Increment,
        //                             as: 'increment',
        //                         }
        //                     ]
        //                 },
        //                 {
        //                     model: SalaryClass,
        //                     as: 'class'
        //                 }
        //             ]
        //         }
        //     ],
        //     attributes: [
        //         ['id', 'value'],
        //         [
        //             Sequelize.literal('`salary->rates->increment`.`name`'),
        //             'label'
        //         ],
        //         [
        //             Sequelize.literal('`salary->class`.`name`'),
        //             'class'
        //         ],
        //         [
        //             Sequelize.literal('`salary->rates`.`monthlyCompensation`'),
        //             'monthly'
        //         ],
        //     ]
        // }); 

        const recruitmentCompanies = await Company.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        }); 

        const recruitmentSchedules = await ScheduleShift.findAll({
            include: [
                {
                    model: ScheduleClass,
                    as: 'class'
                }
            ],
            attributes: [
                ['id', 'value'],
                [
                    Sequelize.literal(
                        "CONCAT(`class`.`name`, ' - ', DATE_FORMAT(`ScheduleShift`.`timeStart`, '%h:%i %p'), ' to ', DATE_FORMAT(`ScheduleShift`.`timeEnd`, '%h:%i %p'))"
                    ),
                    'label'
                ]
            ]
        }); 

        const sexes = await Sex.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        });

        const schoollevels = await SchoolLevel.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        });

        const employmentstatuses = await EmploymentStatus.findAll({
            attributes: [
                ['id', 'value'],
                ['name', 'label']
            ]
        });

        res.json({
            role: roles,
            employee: employees,
            departments: departments,
            position: positions,
            increment: increments,
            scheduleclass: scheduleclasses,
            premiumpay: premiumpays,
            salaryclass: salaryclasses,
            salarygrade: salarygrades,
            salary: salaries,
            recruitmentSteps: recruitmentSteps,
            recruitmentCompanies: recruitmentCompanies,
            recruitmentSchedules: recruitmentSchedules,
            sexes: sexes,
            schoollevels,
            employmentstatuses
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

};
