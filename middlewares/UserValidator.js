const { body, validationResult } = require("express-validator");

exports.validateForm = (isCreate = true) => [
    body("employeeNo")
        .trim()
        .notEmpty().withMessage("employee id number is required"),
    body("name")
        .trim()
        .notEmpty().withMessage("name is required")
        .isAlpha('en-US', { ignore: " " }).withMessage("Invalid name format"),
    body("username")
        .trim()
        .notEmpty().withMessage("username is required"),
    body("password")
        .trim()
        .if(() => isCreate)
        .notEmpty().withMessage('password is required')
        .isLength({ min: 4 }).withMessage("Password must be atleast 4 characters"),
    body("roleId")
        .trim()
        .notEmpty().withMessage("office is required"),
    body("level")
        .trim()
        .notEmpty().withMessage("level is required"),
    body("avatar")
        .trim()
        .notEmpty().withMessage("avatar is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
