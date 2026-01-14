const { Op, Sequelize, fn, col, literal } = require("sequelize");
const { 
    Sex, 
    Profile, 
    Department, 
    Increment, 
    Position, 
    ScheduleClass, 
    PremiumPay, 
    SalaryClass, 
    SalaryGrade, 
    Salary, 
    Rate, 
    Company, 
    ScheduleShift, 
    EmploymentStatus, 
    SchoolLevel, 
    SignatoryType, 
    User, 
    PositionQualification, 
    CivilStatus, 
    BloodType, 
    Province, 
    Barangay, 
    Town, 
    School, 
    Course, 
    DocumentType, 
    Region, 
    Vacancy, 
    Application,
    TaxCode,
    AppointmentStatus,
    Relationship,
    TrainingType
} = require('../models');

exports.GetRoles = async (req, res) => {
    try {
        const data = await Role.findAll({
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
}

exports.GetEmployees = async (req, res) => {
    try {
        const data = await Profile.findAll({
            attributes: [
                ['id', 'value'],
                [
                    Sequelize.fn(
                        'CONCAT',
                        Sequelize.col('firstname'), ' ',
                        Sequelize.col('middlename'), ' ',
                        Sequelize.col('lastname'), ' ',
                        Sequelize.col('suffix')
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
                ['name', "label"]
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
                ['name', "label"]
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
                ['name', "label"]
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
                ['name', "label"]
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
                ['name', "label"]
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
                ['name', "label"]
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
                ['name', "label"],
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
                        "CONCAT(`class`.`name`, ' - ', `grade`.`name`)"
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
    const id = req.query.id || '';
    try {
        const data = await Salary.findAll({
            where: {
                id
            },
            include: [
                {
                    model: Rate,
                    as: 'rates',
                    required: true,
                    include: [
                        {
                            model: Increment,
                            as: 'increment',
                            required: true
                        }
                    ]
                }
            ]
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
                ['name', "label"]
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
                        "CONCAT(`class`.`name`, ' - ', DATE_FORMAT(`ScheduleShift`.`timeStart`, '%h:%i %p'), ' to ', DATE_FORMAT(`ScheduleShift`.`timeEnd`, '%h:%i %p'))"
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
                ['name', "label"]
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
                ['name', "label"]
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
                ['name', "label"]
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
                ['name', "label"]
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
                role: {
                    [Op.in]: ['SuperAdmin', 'Admin', 'Supervisor', 'HR', 'Finance']
                }
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
                        "CONCAT(`profile`.`firstname`, ' ', `profile`.`middlename`, ' ', `profile`.`lastname`, ' - ', `User`.`role`)"
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
        const data = await Salary.findAll({
            where: {
                status: 'Vacant'
            },
            include: [
                {
                    model: Position,
                    as: 'positions',
                    attributes: [
                        "name", 'description'
                    ],
                    include: [
                        {
                            model: PositionQualification,
                            as: 'qualifications',
                            attributes: [
                                "name"
                            ]
                        }
                    ]
                },
                {
                    model: SalaryClass,
                    as: 'class',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: SalaryGrade,
                    as: 'grade',
                    attributes: [
                        "name"
                    ]
                }
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
                "name", "description"
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
                            "CONCAT(`firstname`, ' ', `middlename`, ' ', `lastname`, ' ', `suffix`)"
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
                    ['name', "label"]
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
                    ['name', "label"]
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
                    ['id', 'value'],
                    ['name', "label"]
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
    const regionId = req.query.regionId;
    const whereCondition = regionId && regionId.trim() !== ''
        ? { regionId: { [Op.eq]: regionId } }
        : {};
    try {
        const data = await Province.findAll(
            {
                where: whereCondition,
                attributes: [
                    ['id', 'value'],
                    ['name', "label"]
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
    const provinceId = req.query.provinceId;
    const whereCondition = provinceId && provinceId.trim() !== ''
        ? { provinceId: { [Op.eq]: provinceId } }
        : {};
    try {
        const data = await Town.findAll(
            {
                where: whereCondition,
                attributes: [
                    ['id', 'value'],
                    ['name', "label"]
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
    const townId = req.query.townId;
    const whereCondition = townId && townId.trim() !== ''
        ? { townId: { [Op.eq]: townId } }
        : {};
    try {
        const data = await Barangay.findAll(
            {
                where: whereCondition,
                attributes: [
                    ['id', 'value'],
                    ['name', "label"],
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
                    ['name', "label"]
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
                    ['name', "label"]
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
                    ['name', "label"]
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

exports.GetVacancies = async (req, res) => {
    try {
        const data = await Vacancy.findAll(
            {
                where: {
                    status: 'Approved'
                },
                include: [
                    {
                        model: Salary,
                        as: 'salary',
                        attributes: [
                            'id'
                        ],
                        include: [
                            {
                                model: Rate,
                                as: 'rates',
                                required: false,
                                where: {
                                    stepId: { [Op.col]: "Vacancy.stepId" }
                                }
                            },
                            {
                                model: Position,
                                as: 'positions',
                                attributes: [
                                    'name'
                                ]
                            },
                        ]
                    },
                    {
                        model: Department,
                        as: 'department',
                        attributes: [
                            'name'
                        ]
                    },
                    {
                        model: Company,
                        as: 'company',
                        attributes: [
                            'name'
                        ]
                    }
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

exports.GetHiredApplications = async (req, res) => {
    try {
        const data = await Application.findAll(
            {
                where: {
                    status: 'Hired',
                    isActive: true
                },
                include: [
                    {
                        model: Profile,
                        as: 'profile'
                    }
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

exports.GetTaxCodes = async (req, res) => {
    try {
        const data = await TaxCode.findAll(
            {
                where: {
                    isActive: true
                },
                attributes: [
                    ['id', 'value'],
                    ['name', "label"]
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

exports.GetAppointmnentStatuses = async (req, res) => {
    try {
        const data = await AppointmentStatus.findAll(
            {
                where: {
                    isActive: true
                },
                attributes: [
                    ['id', 'value'],
                    ['name', "label"]
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

exports.GetRelationships = async (req, res) => {
    try {
        const data = await Relationship.findAll(
            {
                attributes: [
                    ['id', 'value'],
                    ['name', "label"]
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

exports.GetSalaryRates = async (req, res) => {
    try {
        const data = await Salary.findAll({
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
                    model: SalaryGrade,
                    as: 'grade',
                    attributes: [
                        'name'
                    ]
                }
            ],
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
}

exports.GetSalaryPositions = async (req, res) => {
    try {
        const data = await Salary.findAll({
            where: {
                [Op.or]: [
                    { status: 'Vacant' },
                    { status: 'Requested' }
                ]
            },
            include: [
                {
                    model: Position,
                    as: 'positions',
                    attributes: []
                },
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
                ['id', 'id'],
                ['positionId', 'positionId'],
                ['status', 'status'],
                [
                    Sequelize.literal(
                        "`positions`.`name`"
                    ),
                    'label'
                ],
                [
                    Sequelize.literal(
                        "`class`.`name`"
                    ),
                    'className'
                ],
                [
                    Sequelize.literal(
                        "`grade`.`name`"
                    ),
                    'gradeName'
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

exports.GetRates = async (req, res) => {
    const salaryId = req.query.salaryId;
    const whereCondition = salaryId && salaryId.trim() !== ''
        ? { salaryId: { [Op.eq]: salaryId } }
        : {};
    try {
        const data = await Rate.findAll({
            where: whereCondition,
            include: [
                {
                    model: Increment,
                    as: 'increment',
                    attributes: [
                        'name'
                    ]
                },
                {
                    model: Salary,
                    as: 'salary',
                    attributes: [],
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
                    ]
                }
            ],
            attributes: [
                ['id', 'id'],
                ['salaryId', 'salaryId'],
                ['stepId', 'stepId'],
                ['monthlyCompensation', 'monthlyCompensation'],
                [
                    Sequelize.literal(
                        "`salary->class`.`name`"
                    ),
                    'className'
                ],
                [
                    Sequelize.literal(
                        "`salary->grade`.`name`"
                    ),
                    'gradeName'
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

exports.GetEmploymentSalaryPositions = async (req, res) => {
    try {
        const data = await Salary.findAll({
            where: {
                [Op.or]: [
                    { status: 'Vacant' },
                    { status: 'Requested' },
                    { status: 'Filled' }
                ]
            },
            include: [
                {
                    model: Position,
                    as: 'positions',
                    attributes: []
                },
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
                ['id', 'id'],
                ['positionId', 'positionId'],
                ['status', 'status'],
                [
                    Sequelize.literal(
                        "`positions`.`name`"
                    ),
                    'label'
                ],
                [
                    Sequelize.literal(
                        "`class`.`name`"
                    ),
                    'className'
                ],
                [
                    Sequelize.literal(
                        "`grade`.`name`"
                    ),
                    'gradeName'
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

exports.GetTrainingTypes = async (req, res) => {
    try {
        const data = await TrainingType.findAll({
            attributes: [
                ['id', 'value'],
                ['name', "label"]
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