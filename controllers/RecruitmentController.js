const { Op } = require("sequelize");
const { Position, SalaryGrade, PositionQualification, Salary, Vacancy, Signatory, VacancyRequest, Rate, Company, Department, ScheduleShift, ScheduleClass, Sex, SchoolLevel, EmploymentStatus, User, Profile } = require('../models');

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {

        const { count, rows } = await Vacancy.findAndCountAll({
            include: [
                {
                    model: Position,
                    as: 'position',
                    attributes: [
                        "name", "description"
                    ],
                    include: [
                        {
                            model: Salary,
                            as: 'salary',
                            include: [
                                {
                                    model: SalaryGrade,
                                    as: 'grade'
                                },
                                {
                                    model: Rate,
                                    as: 'rates',
                                    required: false,
                                    where: {
                                        stepId: { [Op.col]: "Vacancy.stepId" }
                                    }
                                }
                            ]
                        },
                        {
                            model: PositionQualification,
                            as: 'qualifications'
                        }
                    ]
                },
                {
                    model: Company,
                    as: 'company',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: ScheduleShift,
                    as: 'shift',
                    attributes: [
                        "timeStart", "timeEnd"
                    ],
                    include: [
                        {
                            model: ScheduleClass,
                            as: 'class',
                            attributes: [
                                "name"
                            ]
                        }
                    ]
                },
                {
                    model: Sex,
                    as: 'sex',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: SchoolLevel,
                    as: 'schoolLevel',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: EmploymentStatus,
                    as: 'employmentStatus',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: VacancyRequest,
                    as: 'requests',
                    include: [
                        {
                            model: Signatory,
                            as: 'signatory',
                            include: [
                                {
                                    model: User,
                                    as: 'user',
                                    include: [
                                        {
                                            model: Profile,
                                            as: 'profile'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            where: Filter
                ? { '$position.name$': { [Op.like]: `%${Filter}%` } }
                : undefined,
            subQuery: false,
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
        positionId,
        stepId,
        companyId,
        departmentId,
        shiftId,
        date,
        location,
        movement,
        justification,
        needBackgroundCheck,
        sexId,
        ageRange,
        levelId,
        yearExperience,
        employmentId
    } = req.body;

    try {

        const vacancy = await Vacancy.create({
            positionId,
            stepId,
            companyId,
            departmentId,
            shiftId,
            dateNeeded: date,
            location,
            movement,
            justification,
            needBackgroundCheck,
            sexId,
            ageRange,
            levelId,
            yearExperience,
            employmentId,
            status: 'Requested'
        });

        const position = await Position.findByPk(positionId);
        await position.update({ 
            status: 'Requested'
        });

        const signatories = await Signatory.findAll({
            where: {
                typeId: 1
            }
        });
        if (signatories.length > 0) {
            const requestsData = signatories.map(signatory => ({
                vacancyId: vacancy.id,
                signatoryId: signatory.id
            }));
            await VacancyRequest.bulkCreate(requestsData);
        }

        res.status(201).json({
            message: "Record Saved!", 
            vacancy: vacancy
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

// exports.Update = async (req, res) => {

//     const { 
//         id 
//     } = req.params;

//     const { 
//         name
//     } = req.body;

//     try {

//         const sex = await Sex.findByPk(id);
        
//         if (!sex) {
//             return res.status(500).json({
//                 errors: [{
//                     type: "manual",
//                     value: "",
//                     msg: "Record not found!",
//                     path: "name",
//                     location: "body",
//                 }],
//             });
//         }

//         const exist = await Sex.findOne({
//             where: {
//                 [Op.or]: [{ name }],
//                 id: { [Op.ne]: id }
//             },
//         });
//         if (exist) {
//             return res.status(500).json({
//                 errors: [{
//                     type: "manual",
//                     value: "",
//                     msg: "Record already in use!",
//                     path: "name",
//                     location: "body",
//                 }],
//             });
//         }

//         await sex.update({ 
//             name
//         });

//         res.status(201).json({
//             message: "Record Modified!", 
//             sex: sex
//         });

//     } catch (error) {

//         res.status(400).json({ 
//             error: error.message 
//         });

//     }
// };

// exports.Disable = async (req, res) => {

//     const { 
//         id 
//     } = req.params;
  
//     try {

//         const sex = await Sex.findByPk(id);

//         if (!sex) {
//             return res.status(500).json({
//                 errors: [{
//                     type: "manual",
//                     value: "",
//                     msg: "Record not found!",
//                     path: "",
//                     location: "body",
//                 }],
//             });
//         }

//         await sex.update({ 
//             isActive: false
//         });

//         res.status(200).json({
//             message: "Record Disabled!", 
//             sex: sex 
//         });

//     } catch (error) {

//         res.status(500).json({ 
//             error: error.message 
//         });

//     }
// };

// exports.Enable = async (req, res) => {

//     const { 
//         id 
//     } = req.params;
  
//     try {

//         const sex = await Sex.findByPk(id);

//         if (!sex) {
//             return res.status(500).json({
//                 errors: [{
//                     type: "manual",
//                     value: "",
//                     msg: "Record not found!",
//                     path: "",
//                     location: "body",
//                 }],
//             });
//         }

//         await sex.update({ 
//             isActive: true 
//         });

//         res.status(200).json({
//             message: "Record Enabled!.", 
//             sex: sex
//         });
//     } catch (error) {

//         res.status(500).json({ 
//             error: error.message 
//         });

//     }
// };