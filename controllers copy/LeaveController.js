const { Op } = require("sequelize");
const { Leave, ProfileLeave, Profile, LeaveType, User, EmploymentInformation, Signatory, LeaveRequest } = require('../models');
const moment = require('moment');

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;
    const { month, year } = req.query;

    try {

        const months = parseInt(month); // e.g., 11 for November
        const years = parseInt(year);   // e.g., 2025

        // Build month start and end
        const startDateMoment = moment(`${years}-${months}-01`, "YYYY-MM-DD").startOf("month");
        const endDateMoment = moment(`${years}-${months}-01`, "YYYY-MM-DD").endOf("month");

        // Format for DB query
        const startDate = startDateMoment.format("YYYY-MM-DD");
        const endDate = endDateMoment.format("YYYY-MM-DD");
        
        const { count, rows } = await Leave.findAndCountAll({
            include: [
                {
                    model: ProfileLeave,
                    as: 'profileLeave',
                    attributes: [
                        'credit', 'profileId'
                    ],
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: [
                                'firstname', 'middlename', 'lastname', 'suffix'
                            ],
                            where: Filter
                                ? {
                                    [Op.or]: [
                                        { firstname: { [Op.like]: `%${Filter}%` } },
                                        { middlename: { [Op.like]: `%${Filter}%` } },
                                        { lastname: { [Op.like]: `%${Filter}%` } },
                                    ]
                                }
                            : undefined
                        },
                        {
                            model: LeaveType,
                            as: 'leaveType',
                            attributes: [
                                'name'
                            ],
                            where: Filter
                                ? {
                                    name: { [Op.like]: `%${Filter}%` }
                                }
                            : undefined
                        }
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    { dateStart: { [Op.lte]: endDate } }, // leave starts before or on endOfMonth
                    { dateEnd: { [Op.gte]: startDate } }  // leave ends after or on startOfMonth
                ]
            },
            limit: Limit,
            offset: Offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            data: rows,
            meta: {
                TotalItems: count,
                TotalPages: Math.ceil(count / Limit),
                CurrentPage: Page
            }
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GetDetails = async (req, res) => {

    const { id } = req.params;

    try {
        
        const rows = await Leave.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: ProfileLeave,
                    as: 'profileLeave',
                    attributes: [
                        'credit', 'profileId'
                    ],
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: [
                                'firstname', 'middlename', 'lastname', 'suffix'
                            ]
                        },
                        {
                            model: LeaveType,
                            as: 'leaveType',
                            attributes: [
                                'name'
                            ]
                        }
                    ]
                },
                {
                    model: LeaveRequest,
                    as: 'requests',
                    include: [
                        {
                            model: Signatory,
                            as: 'signatory',
                            include: [
                                {
                                    model: User,
                                    as: 'user',
                                    include: [
                                        {
                                            model: Profile,
                                            as: 'profile'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [
                [
                    { model: LeaveRequest, as: 'requests' },
                    { model: Signatory, as: 'signatory' },
                        'order',
                        'ASC'
                ],
            ]
        });

        res.json({
            data: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

const Get = async (id) => {
    return await Leave.findOne({
        where: { 
            id 
        },
        include: [
            {
                model: ProfileLeave,
                as: 'profileLeave',
                attributes: [
                    'credit', 'profileId'
                ],
                include: [
                    {
                        model: Profile,
                        as: 'profile',
                        attributes: [
                            'firstname', 'middlename', 'lastname', 'suffix'
                        ]
                    },
                    {
                        model: LeaveType,
                        as: 'leaveType',
                        attributes: [
                            'name'
                        ]
                    }
                ]
            },
            {
                model: LeaveRequest,
                as: 'requests',
                include: [
                    {
                        model: Signatory,
                        as: 'signatory',
                        include: [
                            {
                                model: User,
                                as: 'user',
                                include: [
                                    {
                                        model: Profile,
                                        as: 'profile'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        order: [
            [
                { model: LeaveRequest, as: 'requests' },
                { model: Signatory, as: 'signatory' },
                    'order',
                    'ASC'
            ],
        ]
    });
};

exports.GetAllUsers = async (req, res) => {

    try {
        
        const rows = await Profile.findAll({
            where: {
                isEmployee: true
            },
            attributes: [
                'id', 'firstname', 'middlename', 'lastname', 'suffix'
            ],
            include: [
                {
                    model: EmploymentInformation,
                    as: 'employment',
                    attributes: [
                        'employeeNo'
                    ]
                }
            ],
        });
        return res.status(200).json(rows);
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GetAllProfileLeaves = async (req, res) => {

    const { profileId } = req.query;

    try {
        const rows = await ProfileLeave.findAll({
            where: {
                isActive: true,
                profileId: profileId
            },
            include: [
                {
                    model: LeaveType,
                    as: 'leaveType',
                    attributes: [
                        'id', 'name'
                    ]
                }
            ]
        });
        const result = rows.map(r => ({
            id: r.id,
            name: r.leaveType?.name
        }));
        return res.status(200).json(result);
    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.Create = async (req, res) => {

    const { 
        profileId,
        typeId,
        dateStart,
        dateEnd,
        reason
    } = req.body;

    try {
        const user = await User.findOne({
            where: { 
                profileId 
            },
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    attributes: ['firstname', 'lastname'],
                    include: [
                        {
                            model: EmploymentInformation,
                            as: 'employment'
                        }
                    ]
                }
            ]
        });
        // 1st Signatory
        const primarySignatory = await Signatory.findOne({
            where: {
                userId: user.id,
                order: 1,
                typeId: 3,
                isActive: true
            }
        });

        if (!primarySignatory) {
            return res.status(404).json({
                message: 'Primary signatory not found for this profile.'
            });
        }

        // 2nd Signatory
        const employment = user?.profile?.employment;

        if (!employment?.departmentId) {
            return res.status(400).json({
                message: 'User has no department assigned.'
            });
        }

        const depSignatory = await Signatory.findOne({
            where: {
                isActive: true,
                typeId: 3,
                isHead: true,
                order: 2
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id'],
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: ['firstname', 'lastname'],
                            include: [
                                {
                                    model: EmploymentInformation,
                                    as: 'employment',
                                    where: {
                                        departmentId: employment.departmentId
                                    },
                                    attributes: []
                                }
                            ]
                        }
                    ]
                }
            ]
        });


        // above 3rd signatories
        const otherSignatories = await Signatory.findAll({
            where: {
                isActive: true,
                typeId: 3,
                order: { [Op.gt]: 2 }
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id'],
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: ['firstname', 'lastname']
                        }
                    ]
                }
            ],
            order: [['order', 'ASC']]
        });
        if (!otherSignatories) {
            return res.status(404).json({
                message: 'Primary signatory not found for this profile.'
            });
        }

        // 3️⃣ Merge maintaining approval order
        const signatories = [
            primarySignatory,
            depSignatory,
            ...otherSignatories
        ];

        // save leave
        const leave = await Leave.create({
            profileId,
            leaveId: typeId,
            dateStart,
            dateEnd,
            reason
        });

        // save signatories to leave request
        for (const signatory of signatories) {
            await LeaveRequest.create({
                leaveId: leave.id,
                signatoryId: signatory.id,
                status: 'Pending'
            });
        }

        res.status(201).json({
            message: "Record Saved!", 
            leave: signatories
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Approve = async (req, res) => {

    const { 
        id,
        signatoryId
    } = req.params;

    try {

        const leave = await Leave.findByPk(id);
        
        if (!leave) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "id",
                    location: "body",
                }],
            });
        }

        await leave.update({ 
            status: 'Filed'
        });

        await LeaveRequest.update({
            status: "Approved",
            }, {
                where: {
                    leaveId: id,
                    signatoryId: signatoryId
                }
        });
        const pendingRequests = await LeaveRequest.count({
            where: {
                leaveId: id,
                status: { [Op.ne]: "Approved" },
                isActive: true
            }
        });
        if (pendingRequests === 0) {
            await leave.update({ 
                status: 'Approved'
            });
        }

        const d = await Get(id);

        res.status(201).json({
            message: "Record Filed!", 
            leave: d
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Cancel = async (req, res) => {

    const { 
        id 
    } = req.params;
  
    try {

        const leave = await Leave.findByPk(id);

        if (!leave) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "name",
                    location: "body",
                }],
            });
        }

        await leave.update({ 
            status: 'Cancelled'
        });

        const l = await Get(leave.id);

        res.status(200).json({
            message: "Record Disabled!", 
            leave: l 
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

// exports.Enable = async (req, res) => {

//     const { 
//         id 
//     } = req.params;
  
//     try {

//         const sex = await Sex.findByPk(id);

//         if (!sex) {
//             return res.status(500).json({
//                 errors: [{
//                     type: "field",
//                     value: id,
//                     msg: "Record not found!",
//                     path: "name",
//                     location: "body",
//                 }],
//             });
//         }

//         await sex.update({ 
//             isActive: true 
//         });

//         res.status(200).json({
//             message: "Record Enabled!.", 
//             sex: sex
//         });
//     } catch (error) {

//         res.status(500).json({ 
//             error: error.message 
//         });

//     }
// };