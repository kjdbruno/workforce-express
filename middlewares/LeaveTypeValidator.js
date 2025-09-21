const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("name")
        .trim()
        .notEmpty().withMessage("name is required")
        .isAlpha('en-US', { ignore: " " }).withMessage("Invalid name format"),
    body("credit")
        .trim()
        .notEmpty().withMessage("credit is required")
        .isFloat({ min: 0 }).withMessage("credit must be a valid number"),
    body("accrual")
        .trim()
        .notEmpty().withMessage("accrual is required"),
    body("carryOver")
        .trim()
        .notEmpty().withMessage("carry over is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
