const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("vacancyId")
        .trim()
        .notEmpty().withMessage("vacancy is required"),
    body("firstname")
        .trim()
        .notEmpty().withMessage("firstname is required"),
    body("middlename")
        .trim()
        .notEmpty().withMessage("middlename is required"),
    body("lastname")
        .trim()
        .notEmpty().withMessage("lastname is required"),
    body("suffix")
        .optional({ checkFalsy: true })
        .trim()
        .custom((value) => {
        const allowedSuffixes = [
            "SR","JR","II","III","IV","V","VI","VII","VIII","IX","X"
        ];
        if (value && !allowedSuffixes.includes(value.toUpperCase())) {
            throw new Error("invalid suffix");
        }
        return true;
    }),
    body("sex")
        .trim()
        .notEmpty().withMessage("sexId is required"),
    body("civilstatus")
        .trim()
        .notEmpty().withMessage("civil status is required"),
    body("birthdate")
        .trim()
        .notEmpty().withMessage("birthdate is required"),
    body("birthplace")
        .trim()
        .notEmpty().withMessage("birthplace is required"),
    body("bloodtype")
        .trim()
        .notEmpty().withMessage("blood type is required"),
    body("email")
        .trim()
        .notEmpty().withMessage("email is required")
        .isEmail().withMessage("email must be a valid email address")
        .isLength({ max: 100 }).withMessage("email must not exceed 100 characters"),
    body("contactNo")
        .trim()
        .notEmpty().withMessage("contactNo is required")
        .matches(/^(09\d{9}|\+639\d{9})$/)
        .withMessage("enter a valid PH mobile number (e.g., 09123456789 or +639123456789)"),
    body("address")
        .trim()
        .notEmpty().withMessage("address is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
