const { body, validationResult } = require("express-validator");

exports.ValidateForm = (isCreate = true) => [
    body("profileId")
        .trim()
        .notEmpty().withMessage("employee is required"),
    body("username")
        .trim()
        .notEmpty().withMessage("username is required"),
    body("password")
        .trim()
        .if(() => isCreate)
        .notEmpty().withMessage('password is required')
        .isLength({ min: 4 }).withMessage("Password must be atleast 4 characters"),
    body("role")
        .trim()
        .notEmpty().withMessage("role is required"),
    body("status")
        .trim()
        .notEmpty().withMessage("status is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
