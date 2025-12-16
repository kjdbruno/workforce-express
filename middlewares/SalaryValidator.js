const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("classId")
        .trim()
        .notEmpty().withMessage("salary class is required"),
    body("positionId")
        .trim()
        .notEmpty().withMessage("position is required"),
    body("gradeId")
        .trim()
        .notEmpty().withMessage("salary grade is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
