const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("type")
        .trim()
        .notEmpty().withMessage("document type is required"),
    body("approverId")
        .trim()
        .notEmpty().withMessage("approver is required"),
    body("description")
        .trim()
        .notEmpty().withMessage("description is required"),
    body("order")
        .trim()
        .notEmpty().withMessage("order is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
