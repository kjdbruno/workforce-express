const { Op } = require("sequelize");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require("../models");

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Offset = (Page - 1) * Limit;

    try {
        const { count, rows } = await User.findAndCountAll({
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

const GetUser = async (id) => {

    const rows  = await User.findOne({
        include: [
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

exports.UpdateStatus = async (req, res) => {

    const { 
        id 
    } = req.params;
    const {
        status
    } = req.body;
  
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
            status
        });

        res.status(201).json({
            message: "record disabled!", 
            user
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};