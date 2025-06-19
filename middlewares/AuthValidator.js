const { body, validationResult } = require("express-validator");

exports.validateForm = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required"),
    body("password")
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 4 }).withMessage("Password must be at least 4 characters"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
