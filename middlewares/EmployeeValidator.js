const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
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
    body("sexId")
        .trim()
        .notEmpty().withMessage("sexId is required"),
    body("maritalId")
        .trim()
        .notEmpty().withMessage("maritalId is required"),
    body("birthdate")
        .trim()
        .notEmpty().withMessage("birthdate is required"),
    body("birthplace")
        .trim()
        .notEmpty().withMessage("birthplace is required"),
    body("weight")
        .trim()
        .notEmpty().withMessage("weight is required")
        .isFloat({ min: 1, max: 500 }).withMessage("weight must be between 1 and 500"),
    body("height")
        .trim()
        .notEmpty().withMessage("height is required")
        .isFloat({ min: 30, max: 300 }).withMessage("height must be between 30 and 300 cm"),
    body("bloodTypeId")
        .trim()
        .notEmpty().withMessage("bloodTypeId is required"),
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
    body("regionId")
        .trim()
        .notEmpty().withMessage("province is required"),
    body("provinceId")
        .trim()
        .notEmpty().withMessage("province is required"),
    body("townId")
        .trim()
        .notEmpty().withMessage("town is required"),
    body("barangayId")
        .trim()
        .notEmpty().withMessage("barangay is required"),
    body("streetAddress")
        .trim()
        .notEmpty().withMessage("streetAddress is required"),
    body("dateHired")
        .trim()
        .notEmpty().withMessage("date Hired is required"),
    body("salaryId")
        .trim()
        .notEmpty().withMessage("salary rate is required"),
    body("rateId")
        .trim()
        .notEmpty().withMessage("rate is required"),
    body("employmentId")
        .trim()
        .notEmpty().withMessage("employment status is required"),
    body("appointmentId")
        .trim()
        .notEmpty().withMessage("appointment status is required"),
    body("companyId")
        .trim()
        .notEmpty().withMessage("company is required"),
    body("departmentId")
        .trim()
        .notEmpty().withMessage("department is required"),
    body("shiftId")
        .trim()
        .notEmpty().withMessage("schedule is required"),
    body("tin")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 15 }).withMessage("tin must not exceed 15 characters"),
    body("sssNo")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 15 }).withMessage("sss number must not exceed 15 characters"),
    body("philhealthNo")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 15 }).withMessage("philhealth number must not exceed 15 characters"),
    body("pagibigNo")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 15 }).withMessage("pagibig number must not exceed 15 characters"),
    body("taxCodeId")
        .trim()
        .notEmpty().withMessage("tax Code is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
