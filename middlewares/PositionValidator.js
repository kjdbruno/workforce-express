const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("salaryId")
        .trim()
        .notEmpty().withMessage("salary is required"),
    body("name")
        .trim()
        .notEmpty().withMessage("name is required")
        .isAlpha('en-US', { ignore: " " })
        .withMessage("Invalid name format"),
    body("description")
        .trim()
        .notEmpty().withMessage("description is required"),
    body("qualifications")
        .isArray({ min: 1 })
        .withMessage("At least one qualification is required"),
    body("qualifications.*.name")
        .trim()
        .notEmpty()
        .withMessage("Qualification name is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
