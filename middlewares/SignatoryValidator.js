const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("userId")
        .trim()
        .notEmpty().withMessage("User/Employee is required"),
    body("typeId")
        .trim()
        .notEmpty().withMessage("signatory type is required"),
    (req, res, next) => {
        console.log("REQ BODY:", req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
