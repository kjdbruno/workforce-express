const { Op } = require("sequelize");
const { Sex } = require('../models');

exports.getAllSexes = async (req, res) => {
    try {
        const sexes = await Sex.findAll();
        res.json(sexes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
