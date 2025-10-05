const { Op, Sequelize, fn, col, literal } = require("sequelize");
const { Sex, Role, Profile, Department, Increment, Position, ScheduleClass, PremiumPay, SalaryClass, SalaryGrade, Salary, Rate, Company, ScheduleShift, EmploymentStatus, SchoolLevel, SignatoryType, User, PositionQualification, CivilStatus, BloodType, Province, Barangay, Town, School, Course, DocumentType, Region } = require('../models');
const role = require("../models/role");

exports.GetRoles = async (req, res) => {
    try {
        const data = await Role.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            order: [['id', 'ASC']]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetEmployees = async (req, res) => {
    try {
        const data = await Profile.findAll({
            attributes: [
                ['id', 'value'],
                [
                    Sequelize.fn(
                        'UPPER',
                        Sequelize.fn(
                        'CONCAT',
                        Sequelize.col('firstname'), ' ',
                        Sequelize.col('middlename'), ' ',
                        Sequelize.col('lastname'), ' ',
                        Sequelize.col('suffix')
                        )
                    ),
                    'name'
                ]
            ]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetDepartments = async (req, res) => {
    try {
        const data = await Department.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            where: {
                isActive: true
            }
        }); 
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetPositions = async (req, res) => {
    try {
        const data = await Position.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            where: {
                isActive: true
            }
        }); 
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetScheduleClasses = async (req, res) => {
    try {
        const data = await ScheduleClass.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            where: {
                isActive: true
            }
        }); 
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetPremiumPays = async (req, res) => {
    try {
        const data = await PremiumPay.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            where: {
                isActive: true
            }
        }); 
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetSalaryClasses = async (req, res) => {
    try {
        const data = await SalaryClass.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            where: {
                isActive: true
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetSalaryGrades = async (req, res) => {
    try {
        const data = await SalaryGrade.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            where: {
                isActive: true
            }
        }); 
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetIncrements = async (req, res) => {
    try {
        const data = await Increment.findAll({
            order: [['id', 'ASC']],
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"],
                ['id', 'stepId'],
                [literal('NULL'), 'id'],
                [literal('NULL'), 'monthlyCompensation'],
                [literal('NULL'), 'dailyCompensation'],
                [literal('NULL'), 'hourlyCompensation']
            ],
            where: {
                isActive: true
            }
        });
        return res.status(200).json(data); 
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetSalaries = async (req, res) => {
    try {
        const data = await Salary.findAll({
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
                    Sequelize.literal(
                        "UPPER(CONCAT(`class`.`name`, ' - ', `grade`.`name`))"
                    ),
                    'label'
                ]

            ],
            where: {
                isActive: true
            }
        }); 
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetRecruitmentSteps = async (req, res) => {
    const id = req.query.positionId || '';
    try {
        const data = await Position.findAll({
            where: {
                id
            },
            include: [
                {
                    model: Salary,
                    as: 'salary',
                    required: true,
                    attributes: [],
                    include: [
                        {
                            model: Rate,
                            as: 'rates',
                            required: true,
                            attributes: [],
                            include: [
                                {
                                model: Increment,
                                as: 'increment',
                                required: true,
                                attributes: []
                                }
                            ]
                        },
                        {
                            model: SalaryClass,
                            as: 'class',
                            required: true,
                            attributes: []
                        }
                    ]
                }
            ],
            attributes: [
                [Sequelize.col("salary.rates.increment.id"), 'value'],
                [
                    Sequelize.fn("UPPER", Sequelize.col("salary.rates.increment.name")),
                    "label"
                ],
                [
                    Sequelize.fn("UPPER", Sequelize.col("salary.class.name")),
                    "class"
                ],
                [Sequelize.col("salary.rates.monthlyCompensation"), "monthly"],
                [Sequelize.col("salary.rates.dailyCompensation"), "daily"],
                [Sequelize.col("salary.rates.hourlyCompensation"), "hourly"]
            ],
            raw: true,
            nest: true
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetCompanies = async (req, res) => {
    try {
        const data = await Company.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            where: {
                isActive: true
            }
        }); 
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetRecruitmentSchedules = async (req, res) => {
    try {
        const data = await ScheduleShift.findAll({
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
                        "UPPER(CONCAT(`class`.`name`, ' - ', DATE_FORMAT(`ScheduleShift`.`timeStart`, '%h:%i %p'), ' to ', DATE_FORMAT(`ScheduleShift`.`timeEnd`, '%h:%i %p')))"
                    ),
                    'label'
                ]
            ]
        }); 
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetSexes = async (req, res) => {
    try {
        const data = await Sex.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetSchoolLevels = async (req, res) => {
    try {
        const data = await SchoolLevel.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            where: {
                isActive: true
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetEmploymentStatuses = async (req, res) => {
    try {
        const data = await EmploymentStatus.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            where: {
                isActive: true
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetSignatoryTypes = async (req, res) => {
    try {
        const data = await SignatoryType.findAll({
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("name")), "label"]
            ],
            where: {
                isActive: true
            }
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetSignatories = async (req, res) => {
    try {
        const data = await User.findAll({
            where: {
                level: 'Management'
            },
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    where: {
                        isEmployee: true
                    }
                }
            ],
            attributes: [
                ['id', 'value'],
                [
                    Sequelize.literal(
                        "UPPER(CONCAT(`profile`.`firstname`, ' ', `profile`.`middlename`, ' ', `profile`.`lastname`))"
                    ),
                    'label'
                ]

            ]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetRecruitmentPositions = async (req, res) => {
    try {
        const data = await Position.findAll({
            include: [
                {
                    model: Salary,
                    as: 'salary',
                    attributes: [
                        "id"
                    ],
                    include: [
                        {
                            model: SalaryGrade,
                            as: 'grade',
                            attributes: [
                                "name"
                            ]
                        }
                    ]
                }
            ],
            where: {
                status: 'Vacant'
            },
            attributes: [
                ['id', 'value'],
                [fn("UPPER", col("Position.name")), "label"],
                [
                    Sequelize.fn(
                        'UPPER', Sequelize.col('salary->grade.name')
                    ), 
                    'grade'
                ]
            ]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetRecruitmentQualifications = async (req, res) => {
    const id = req.query.positionId;
    try {
        const data = await Position.findAll({
            include: [
                {
                    model: PositionQualification,
                    as: 'qualifications',
                    attributes: [
                        "name"
                    ],
                    where: {
                        isActive: true
                    }
                }
            ],
            where: {
                id
            },
            attributes: [
                "name", "description", "status"
            ]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetProfiles = async (req, res) => {
    try {
        const data = await Profile.findAll(
            {
                where: {
                    isEmployee: true
                },
                attributes: [
                    ['id', 'value'],
                    [
                        Sequelize.literal(
                            "UPPER(CONCAT(`firstname`, ' ', `middlename`, ' ', `lastname`, ' ', `suffix`))"
                        ),
                        'label'
                    ]
                ]
            }
        );
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetMaritalStatuses = async (req, res) => {
    try {
        const data = await CivilStatus.findAll(
            {
                where: {
                    isActive: true
                },
                attributes: [
                    ['id', 'value'],
                    [fn("UPPER", col("name")), "label"]
                ]
            }
        );
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetBloodTypes = async (req, res) => {
    try {
        const data = await BloodType.findAll(
            {
                where: {
                    isActive: true
                },
                attributes: [
                    ['id', 'value'],
                    [fn("UPPER", col("name")), "label"]
                ]
            }
        );
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetRegions = async (req, res) => {
    try {
        const data = await Region.findAll(
            {
                attributes: [
                    ['id', 'id'],
                    [fn("UPPER", col("name")), "label"],
                    ['regionCode', 'code']
                ]
            }
        );
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetProvinces = async (req, res) => {
    const regionCode = req.query.regionCode;
    try {
        const data = await Province.findAll(
            {
                where: {
                    regionCode
                },
                attributes: [
                    ['id', 'id'],
                    [fn("UPPER", col("name")), "label"],
                    ['provinceCode', 'code']
                ]
            }
        );
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetTowns = async (req, res) => {
    const provinceCode = req.query.provinceCode;
    try {
        const data = await Town.findAll(
            {
                where: {
                    provinceCode
                },
                attributes: [
                    ['id', 'id'],
                    [fn("UPPER", col("name")), "label"],
                    ['townCode', 'code']
                ]
            }
        );
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetBarangays = async (req, res) => {
    const townCode = req.query.townCode;
    try {
        const data = await Barangay.findAll(
            {
                where: {
                    townCode
                },
                attributes: [
                    ['id', 'id'],
                    [fn("UPPER", col("name")), "label"],
                ]
            }
        );
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetSchools = async (req, res) => {
    try {
        const data = await School.findAll(
            {
                attributes: [
                    ['id', 'value'],
                    [fn("UPPER", col("name")), "label"]
                ]
            }
        );
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetCourses = async (req, res) => {
    try {
        const data = await Course.findAll(
            {
                attributes: [
                    ['id', 'value'],
                    [fn("UPPER", col("name")), "label"]
                ]
            }
        );
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetDocumentTypes = async (req, res) => {
    try {
        const data = await DocumentType.findAll(
            {
                attributes: [
                    ['id', 'value'],
                    [fn("UPPER", col("name")), "label"]
                ]
            }
        );
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}