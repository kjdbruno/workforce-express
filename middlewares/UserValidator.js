const { body, validationResult } = require("express-validator");

exports.validateForm = (isCreate = true) => [
    body("name")
        .trim()
        .notEmpty().withMessage("name is required")
        .isAlpha('en-US', { ignore: " " }).withMessage("Invalid name format"),
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required"),
    body("password")
        .trim()
        .if(() => isCreate)
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 4 }).withMessage("Password must be atleast 4 characters"),
    body("officeId")
        .trim()
        .notEmpty().withMessage("Office is required"),
    body("avatar")
        .trim()
        .notEmpty().withMessage("Avatar is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
