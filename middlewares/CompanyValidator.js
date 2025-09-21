const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("name")
        .trim()
        .notEmpty().withMessage("name is required"),
    body("description")
        .trim()
        .notEmpty().withMessage("description is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
