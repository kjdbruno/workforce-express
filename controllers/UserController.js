const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require("../models");

exports.GetAllUsers = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Offset = (Page - 1) * Limit;

    try {
        const { count, rows } = await User.findAndCountAll({
            include: [
                {
                    model: Role,
                    as: 'Role'
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
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {

    const { 
        employeeNo,
        name, 
        username, 
        password, 
        roleId, 
        level,
        avatar 
    } = req.body;

    try {

        const userExist = await User.findOne({
            where: { 
                username 
            }
        });

        if (userExist) {
            return res.status(403).json({
                errors: [{
                    type: "manual",
                    value: "",
                    msg: "record already exists!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            employeeNo,
            name, 
            username, 
            password: hashedPassword, 
            roleId, 
            level,
            avatar 
        });

        res.status(201).json({
            message: "record saved!", 
            user: user
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.updateUser = async (req, res) => {
    // const { id } = req.params;
    // const { name, username, password, officeId, roleId, avatar } = req.body;
    // try {
    //     const user = await User.findByPk(id);
    //     const detail = await UserDetail.findOne({
    //         where: {
    //             userId: id
    //         }
    //     });
    //     if (!user) {
    //         return res.status(403).json({
    //             errors: [{
    //                 type: "manual",
    //                 value: "",
    //                 msg: "User not found!",
    //                 path: "name",
    //                 location: "body",
    //             }],
    //         });
    //     }
    //     const userExist = await User.findOne({
    //         where: {
    //             [Op.or]: [{ username }],
    //             id: { [Op.ne]: id }
    //         },
    //     });
    //     if (userExist) {
    //         return res.status(403).json({
    //             errors: [{
    //                 type: "manual",
    //                 value: "",
    //                 msg: "Username is already in use!",
    //                 path: "username",
    //                 location: "body",
    //             }],
    //         });
    //     }
    //     let hashedPassword = user.password;
    //     if (password) {
    //         hashedPassword = await bcrypt.hash(password, 10);
    //     }
    //     await user.update({ 
    //         name, 
    //         username, 
    //         password: hashedPassword,
    //         isInternal: true
    //     });
    //     await detail.update({
    //         officeId,
    //         roleId,
    //         avatar
    //     });
        
    //     const updated = await User.findAll({
    //         where: {
    //             id: id
    //         },
    //         include: {
    //             model: UserDetail,
    //             as: 'user_details',
    //             include: [
    //                 {
    //                     model: Office,
    //                     as: 'office'
    //                 },
    //                 {
    //                     model: Role,
    //                     as: 'role'
    //                 }
    //             ]
    //         }
    //     });

    //     res.status(201).json({
    //         message: "User updated successfully!", 
    //         user: updated
    //     });
    // } catch (error) {
    //     res.status(400).json({ error: error.message });
    // }
};

exports.disableUser = async (req, res) => {

    // const { id } = req.params;
    // const isActive = false;
  
    // try {
    //     const user = await User.findByPk(id);
    //     if (!user) {
    //         return res.status(403).json({
    //             errors: [{
    //                 type: "manual",
    //                 value: "",
    //                 msg: "User not found!",
    //                 path: "username",
    //                 location: "body",
    //             }],
    //         });
    //     }
    //     await user.update({ isActive });
        
    //     const disabled = await User.findAll({
    //         where: {
    //             id: id
    //         },
    //         include: {
    //             model: UserDetail,
    //             as: 'user_details',
    //             include: [
    //                 {
    //                     model: Office,
    //                     as: 'office'
    //                 },
    //                 {
    //                     model: Role,
    //                     as: 'role'
    //                 }
    //             ]
    //         }
    //     });

    //     res.status(200).json({
    //         message: "User disabled successfully.", 
    //         user: disabled 
    //     });
    // } catch (error) {
    //     res.status(500).json({ error: error.message });
    // }
};

exports.enableUser = async (req, res) => {

    // const { id } = req.params;
    // const isActive = true;
  
    // try {
    //     const user = await User.findByPk(id);
    //     if (!user) {
    //         return res.status(403).json({
    //             errors: [{
    //                 type: "manual",
    //                 value: "",
    //                 msg: "User not found!",
    //                 path: "username",
    //                 location: "body",
    //             }],
    //         });
    //     }

    //     const enabled = await User.findAll({
    //         where: {
    //             id: id
    //         },
    //         include: {
    //             model: UserDetail,
    //             as: 'user_details',
    //             include: [
    //                 {
    //                     model: Office,
    //                     as: 'office'
    //                 },
    //                 {
    //                     model: Role,
    //                     as: 'role'
    //                 }
    //             ]
    //         }
    //     });

    //     await user.update({ isActive });
    //     res.status(200).json({
    //         message: "User enabled successfully.", 
    //         user: enabled
    //     });
    // } catch (error) {
    //     res.status(500).json({ error: error.message });
    // }
};