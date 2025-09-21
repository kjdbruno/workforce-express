const { Op } = require("sequelize");
const { Position, SalaryGrade, PositionQualification, Salary } = require('../models');

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {

        const where = {
            status: { [Op.ne]: 'Filled' } // 👈 exclude filled
        };

        if (Filter) {
            where.name = { [Op.like]: `%${Filter}%` };
        }

        const { count, rows } = await Position.findAndCountAll({
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
                    as: 'qualifications'
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

// exports.Create = async (req, res) => {

//     const { 
//         name
//     } = req.body;

//     try {

//         const exist = await Sex.findOne({
//             where: { 
//                 name 
//             }
//         });

//         if (exist) {
//             return res.status(403).json({
//                 errors: [{
//                     type: "manual",
//                     value: "",
//                     msg: "Record already exists!",
//                     path: "name",
//                     location: "body",
//                 }],
//             });
//         }

//         const sex = await Sex.create({
//             name
//         });

//         res.status(201).json({
//             message: "Record Saved!", 
//             sex: sex
//         });

//     } catch (error) {

//         res.status(400).json({ 
//             error: error.message 
//         });

//     }
// };

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
//             return res.status(403).json({
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
//             return res.status(403).json({
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
//             return res.status(403).json({
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
//             return res.status(403).json({
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