const { body, validationResult } = require("express-validator");

exports.ValidateForm = () => [
    body("positionId")
        .trim()
        .notEmpty().withMessage("position is required"),
    body("stepId")
        .trim()
        .notEmpty().withMessage("step is required"),
    body("companyId")
        .trim()
        .notEmpty().withMessage("company is required"),
    body("departmentId")
        .trim()
        .notEmpty().withMessage("department is required"),
    body("shiftId")
        .trim()
        .notEmpty().withMessage("schedule shift is required"),
    body("date")
        .trim()
        .notEmpty().withMessage("date needed is required"),
    body("location")
        .trim()
        .notEmpty().withMessage("location is required"),
    body("movement")
        .trim()
        .notEmpty().withMessage("movement is required"),
    body("justification")
        .trim()
        .notEmpty().withMessage("justification is required"),
    body("needBackgroundCheck")
        .trim()
        .notEmpty().withMessage("background check is required"),
    body("sexId")
        .trim()
        .notEmpty().withMessage("sex is required"),
    body("ageRange")
        .trim()
        .notEmpty().withMessage("age range is required"),
    body("levelId")
        .trim()
        .notEmpty().withMessage("school level is required"),
    body("yearExperience")
        .trim()
        .notEmpty().withMessage("year/s of experience is required"),
    body("employmentId")
        .trim()
        .notEmpty().withMessage("employment status is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
