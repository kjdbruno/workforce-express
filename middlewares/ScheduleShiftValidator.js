const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("classId")
        .trim()
        .notEmpty().withMessage("schedule class is required"),
    body("timeStart")
        .trim()
        .notEmpty().withMessage("time start is required"),
    body("timeEnd")
        .trim()
        .notEmpty().withMessage("time end is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
