const { Op, fn, col, literal } = require("sequelize");
const db = require('../models');
const { sequelize } = db;

exports.GetAll = async (req, res) => {
    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {
        const where = {
            order: 1,
            createdAt: {
                [Op.eq]: sequelize.literal(`(
                    SELECT MAX(a2.createdAt)
                    FROM ApprovalSettings a2
                    WHERE a2.owner_id = ApprovalSetting.owner_id
                    AND a2.\`order\` = 1
                )`)
            }
        };

        if (Filter) {
            where[Op.or] = [
                { '$owner.name$': { [Op.like]: `%${Filter}%` } }
            ];
        }

        const { count, rows } = await db.ApprovalSetting.findAndCountAll({
            include: [
                {
                    model: db.User,
                    as: 'owner',
                    attributes: [
                        'id', 'role'
                    ],
                    include: [
                        {
                            model: db.EmployeeAccount,
                            as: 'employeeAccount',
                            attributes: [
                                'id'
                            ],
                            include: [
                                {
                                    model: db.Employee,
                                    as: 'employee',
                                    attributes: [
                                        'first_name', 'middle_name', 'last_name', 'suffix'
                                    ],
                                    include: [
                                        {
                                            model: db.Employment,
                                            as: 'employment',
                                            attributes: [
                                                'id'
                                            ],
                                            include: [
                                                {
                                                    model: db.Position,
                                                    as: 'position',
                                                    attributes: [
                                                        'name'
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            model: db.EmployeeSignature,
                                            as: 'signature',
                                            attributes: [
                                                'signature'
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
            ],
            where,
            limit: Limit,
            offset: Offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        return res.json({
        data: rows,
        meta: {
            TotalItems: count,
            TotalPages: Math.ceil(count / Limit),
            CurrentPage: Page
        }
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


exports.GetDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await db.ApprovalSetting.findAll({
      include: [
        {
          model: db.User,
          as: "owner",
          attributes: ["id"],
          include: [
            {
              model: db.EmployeeAccount,
              as: "employeeAccount",
              attributes: ["id"],
              include: [
                {
                  model: db.Employee,
                  as: "employee",
                  attributes: ["first_name", "middle_name", "last_name", "suffix"],
                  include: [
                    {
                      model: db.Employment,
                      as: "employment",
                      attributes: ["id"],
                      include: [{ model: db.Position, as: "position", attributes: ["name"] }],
                    },
                    { model: db.EmployeeSignature, as: "signature", attributes: ["signature"] },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: db.User,
          as: "approver",
          attributes: ["id"],
          include: [
            {
              model: db.EmployeeAccount,
              as: "employeeAccount",
              attributes: ["id"],
              include: [
                {
                  model: db.Employee,
                  as: "employee",
                  attributes: ["first_name", "middle_name", "last_name", "suffix"],
                  include: [
                    {
                      model: db.Employment,
                      as: "employment",
                      attributes: ["id"],
                      include: [{ model: db.Position, as: "position", attributes: ["name"] }],
                    },
                    { model: db.EmployeeSignature, as: "signature", attributes: ["signature"] },
                  ],
                },
              ],
            },
          ],
        },
      ],
      where: { owner_id: id },
      order: [["type", "ASC"], ["order", "ASC"], ["createdAt", "DESC"]],
    });

    // group by type -> array structure
    const map = new Map();

    rows.forEach((row) => {
      const r = row.toJSON();
      const type = r.type || "Unknown";

      if (!map.has(type)) {
        map.set(type, {
          id: r.id,
          isActive: r.is_active,
          type,
          signatories: [],
        });
      }

      // ✅ Convert approver signature BLOB -> base64 data URL (if exists)
      const approverSigBlob =
        r?.approver?.employeeAccount?.employee?.signature?.signature;

      if (approverSigBlob) {
        // mutate safely on the JSON object
        r.approver.employeeAccount.employee.signature.signature =
          `data:image/png;base64,${Buffer.from(approverSigBlob).toString("base64")}`;
      } else {
        // normalize when missing
        if (r?.approver?.employeeAccount?.employee?.signature) {
          r.approver.employeeAccount.employee.signature.signature = null;
        }
      }

      // OPTIONAL: also convert owner signature (if you want)
      const ownerSigBlob =
        r?.owner?.employeeAccount?.employee?.signature?.signature;

      if (ownerSigBlob) {
        r.owner.employeeAccount.employee.signature.signature =
          `data:image/png;base64,${Buffer.from(ownerSigBlob).toString("base64")}`;
      } else {
        if (r?.owner?.employeeAccount?.employee?.signature) {
          r.owner.employeeAccount.employee.signature.signature = null;
        }
      }

      // push the signatory record
      map.get(type).signatories.push({
        id: r.id,
        order: r.order,
        description: r.description,
        owner_id: r.owner_id,
        approver_id: r.approver_id,
        approver: r.approver, // ✅ now includes base64 signature
        owner: r.owner,       // ✅ now includes base64 signature (optional)
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      });
    });

    // convert to array
    const result = Array.from(map.values());

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


exports.GetEmployee = async (req, res) => {
    try {
        const data = await db.User.findAll({
            where: {
                status: 'Active',
                role: 'Employee'
            },
            attributes: [
                ['id', 'value'],
                [
                    literal(`CONCAT(name, ' (', username, ')')`),
                    'label'
                ],
                ['role', 'role'],
            ],
            order: [['id', 'ASC']]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

exports.GetManagement = async (req, res) => {
    try {
        const data = await db.User.findAll({
            where: {
                status: 'Active',
                role: ['Management', 'HR', 'Admin']
            },
            attributes: [
                ['id', 'value'],
                [
                    literal(`CONCAT(name, ' (', username, ')')`),
                    'label'
                ],
                ['role', 'role'],
            ],
            order: [['id', 'ASC']]
        });
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

exports.Create = async (req, res) => {

    const { 
        type,
        ownerid,
        signatories
    } = req.body;

    const sign = Array.isArray(signatories)
        ? signatories
        : JSON.parse(signatories || "[]");

    const transaction = await sequelize.transaction();

    try {

        const exist = await db.ApprovalSetting.findOne({
            where: { 
                type,
                owner_id: ownerid,
                is_active: true
            }
        });

        if (exist) {
            await transaction.rollback();
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: type,
                    msg: "Record already exists!",
                    path: "type",
                    location: "body",
                }],
            });
        }

        // ✅ Build full approval chain (owner first)
        const records = [];

        // 1️⃣ Owner is always order 1
        records.push({
            type,
            owner_id: ownerid,
            approver_id: ownerid,
            description: "requested by",
            order: 1
        });

        // 2️⃣ Then the rest of signatories
        if (sign && sign.length > 0) {
            for (const s of sign) {
                const approverId = Number(s.approverid);
                if (!approverId || isNaN(approverId)) {
                    continue;
                }
                records.push({
                    type,
                    owner_id: ownerid,
                    approver_id: approverId,
                    description: s.description || null,
                    order: Number(s.order) || null
                });
            }
        }


        await db.ApprovalSetting.bulkCreate(records, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: "Record Saved!"
        });

    } catch (error) {

        await transaction.rollback();

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Update = async (req, res) => {

    const { 
        id: owner_id 
    } = req.params
    const { 
        signatories = [] 
    } = req.body

    const transaction = await sequelize.transaction()

    try {

        // 1) get all approval settings under this owner
        const all = await db.ApprovalSetting.findAll({
            where: { 
                owner_id 
            },
            attributes: ['id'],
            transaction
        })

        if (!all.length) {
            await transaction.rollback()
            return res.status(404).json({
                errors: [
                    {
                        type: "field",
                        value: owner_id,
                        msg: "No approval settings found for this owner!",
                        path: "owner_id",
                        location: "params",
                    }
                ]
            })
        }

        // normalize payload to ints (avoid "4" vs 4 mismatch)
        const keepIds = signatories.map(x => Number(x)).filter(Boolean)
        const allIds = all.map(x => x.id)

        // only keep ids that actually belong to this owner (security)
        const safeKeepIds = keepIds.filter(id => allIds.includes(id))

        // ids to disable = those missing from payload
        const disableIds = allIds.filter(id => !safeKeepIds.includes(id))

        // 2) enable selected
        if (safeKeepIds.length) {
        await db.ApprovalSetting.update(
            { is_active: true },
            {
            where: {
                owner_id,
                id: { [Op.in]: safeKeepIds }
            },
            transaction
            }
        )
        }

        // 3) disable missing
        if (disableIds.length) {
            await db.ApprovalSetting.update(
                { is_active: false },
                {
                where: {
                    owner_id,
                    id: { [Op.in]: disableIds }
                },
                transaction
                }
            )
        }

        await transaction.commit()

        return res.status(200).json({
            message: "Signatories updated!"
        })

    } catch (error) {
        await transaction.rollback()
        return res.status(500).json({ error: error.message })
    }
}

const GetApprovalSetting = async (id) => {
    return await db.ApprovalSetting.findAndCountAll({
        include: [
            {
                model: db.User,
                as: 'owner'
            },
            {
                model: db.User,
                as: 'approver'
            }
        ],
        where: {
            id
        }
    });
};