const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role, Profile } = require("../models");

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Offset = (Page - 1) * Limit;

    try {
        const { count, rows } = await User.findAndCountAll({
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: [
                        "name"
                    ]
                },
                {
                    model: Profile,
                    as: 'profile',
                    where: {
                        isEmployee: true
                    },
                    attributes: [
                        "firstname", "middlename", "lastname", "suffix"
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
        res.status(500).json({ error: error.message });
    }
};

GetUser = async (id) => {

    const rows  = await User.findOne({
        include: [
            {
                model: Role,
                as: 'role',
                attributes: [
                    "name"
                ]
            },
            {
                model: Profile,
                as: 'profile',
                where: {
                    isEmployee: true
                },
                attributes: [
                    "firstname", "middlename", "lastname", "suffix"
                ]
            }
        ],
        where: {
            id
        }
    });

    return rows;

};

exports.Create = async (req, res) => {

    const { 
        profileId,
        username, 
        password, 
        roleId, 
        level
    } = req.body;

    try {

        const userExist = await User.findOne({
            where: {
                [Op.or]: [
                    { profileId, level },
                    { username, level }
                ]
            }
        });

        if (userExist) {
            return res.status(500).json({
                errors: [{
                    type: "manual",
                    value: profileId,
                    msg: "record already exists!",
                    path: "profileId",
                    location: "body",
                }],
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            profileId,
            username, 
            password: hashedPassword, 
            roleId, 
            level 
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

exports.Update = async (req, res) => {
    const { 
        id 
    } = req.params;
    const { 
        profileId,
        username, 
        password, 
        roleId, 
        level
    } = req.body;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: username,
                    msg: "Record not found!",
                    path: "profileId",
                    location: "body",
                }],
            });
        }
        const userExist = await User.findOne({
            where: {
                [Op.or]: [
                    { profileId, level },
                    { username, level },
                ],
                id: { [Op.ne]: id }
            }
        });

        if (userExist) {
            return res.status(500).json({
                errors: [{
                    type: "manual",
                    value: profileId,
                    msg: "record already exists!",
                    path: "profileId",
                    location: "body",
                }],
            });
        }
        let hashedPassword = user.password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        await user.update({ 
            profileId,
            username, 
            password: hashedPassword, 
            roleId, 
            level
        });

        const data = await GetUser(user.id);

        res.status(201).json({
            message: "record modified!", 
            user: data
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
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "profileId",
                    location: "body",
                }],
            });
        }
        await user.update({ 
            isActive: false 
        });
        
        const data = await GetUser(user.id);

        res.status(201).json({
            message: "record disabled!", 
            user: data
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
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "profileId",
                    location: "body",
                }],
            });
        }
        await user.update({ 
            isActive: true 
        });
        
        const data = await GetUser(user.id);

        res.status(201).json({
            message: "record disabled!", 
            user: data
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};