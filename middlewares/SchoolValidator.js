const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("name")
        .trim()
        .notEmpty().withMessage("name is required"),
    body("type")
        .trim()
        .notEmpty().withMessage("type is required"),
    body("website")
        .trim()
        .optional(),
    body("contactNo")
        .trim()
        .optional(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
