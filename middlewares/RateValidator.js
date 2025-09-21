const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("classId")
        .trim()
        .notEmpty().withMessage("salary class is required"),
    body("gradeId")
        .trim()
        .notEmpty().withMessage("salary grade is required"),
    body("rates")
        .isArray({ min: 1 })
        .withMessage("At least one rate is required"),
    body("rates.*.stepId")
        .trim()
        .notEmpty()
        .withMessage("Increment is required"),
    body("rates.*.monthlyCompensation")
        .trim()
        .notEmpty()
        .withMessage("Monthly compensation is required"),
    body("rates.*.dailyCompensation")
        .trim()
        .notEmpty()
        .withMessage("Daily compensation is required"),
    body("rates.*.hourlyCompensation")
        .trim()
        .notEmpty()
        .withMessage("Hourly compensation is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
