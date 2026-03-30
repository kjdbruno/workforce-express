const { Op } = require("sequelize");
const db = require('../models');
const { sequelize } = db;

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');

const pug = require('pug');
const puppeteer = require('puppeteer-core');

exports.GetAll = async (req, res) => {
    const Page = parseInt(req.query.Page, 10) || 1;
    const Limit = parseInt(req.query.Limit, 10) || 10;
    const Filter = (req.query.Filter || '').trim();
    const Offset = (Page - 1) * Limit;

    const month = Number(req.query.month);
    const year = Number(req.query.year);

    try {
        const startDate = moment(`${year}-${month}-01`, "YYYY-MM-DD").startOf("month").format("YYYY-MM-DD");
        const endDate   = moment(`${year}-${month}-01`, "YYYY-MM-DD").endOf("month").format("YYYY-MM-DD");

        const where = {
            [Op.and]: [
                { date_from: { [Op.lte]: endDate } },
                { date_to: { [Op.gte]: startDate } },
            ],
            ...(Filter
                ? {
                    [Op.or]: [
                    { '$employee.first_name$':  { [Op.like]: `%${Filter}%` } },
                    { '$employee.middle_name$': { [Op.like]: `%${Filter}%` } },
                    { '$employee.last_name$':   { [Op.like]: `%${Filter}%` } },
                    { '$leaveType.name$':       { [Op.like]: `%${Filter}%` } },
                    ],
                }
                : {}),
        };

        const { count, rows } = await db.EmployeeLeaveApplication.findAndCountAll({
            include: [
                { model: db.Employee, as: 'employee', required: false },
                { model: db.LeaveType, as: 'leaveType', required: false },
            ],
            where,
            subQuery: false,
            distinct: true,
            limit: Limit,
            offset: Offset,
            order: [['createdAt', 'DESC']],
        });

        return res.json({
            data: rows,
            meta: {
                TotalItems: count,
                TotalPages: Math.ceil(count / Limit),
                CurrentPage: Page,
            },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


exports.GetDetails = async (req, res) => {

    const { id } = req.params;

    try {
        
        const leave = await db.EmployeeLeaveApplication.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: db.Employee,
                    as: 'employee',
                },
                {
                    model: db.LeaveType,
                    as: 'leaveType'
                }
            ]
        });

        const approvals = await db.Approval.findAll({
          where: {
            document_id: leave.id,
            is_active: true
          },
          include: [
            {
              model: db.ApprovalSetting,
              as: 'setting',
              where: { type: 'Leave' },
              include: [
                {
                  model: db.User,
                  as: 'approver',
                  attributes: ['id'],
                  include: [
                    {
                      model: db.EmployeeAccount,
                      as: 'employeeAccount',
                      include: [
                        {
                          model: db.Employee,
                          as: 'employee',
                          include: [
                            {
                              model: db.Employment,
                              as: 'employment',
                              include: [{ model: db.Position, as: 'position' }]
                            },
                            { model: db.EmployeeSignature, as: 'signature' }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              model: db.ApprovalOveride,
              as: 'overrides',
              required: false,
              include: [
                {
                  model: db.User,
                  as: 'user',
                  attributes: ['id'],
                  include: [
                    {
                      model: db.EmployeeAccount,
                      as: 'employeeAccount',
                      include: [
                        {
                          model: db.Employee,
                          as: 'employee',
                          include: [
                            {
                              model: db.Employment,
                              as: 'employment',
                              include: [{ model: db.Position, as: 'position' }]
                            },
                            { model: db.EmployeeSignature, as: 'signature' }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ],
          order: [
            [{ model: db.ApprovalSetting, as: 'setting' }, 'order', 'ASC'],
            [{ model: db.ApprovalOveride, as: 'overrides' }, 'createdAt', 'DESC'] // newest override first
          ]
        });
        
        const mappedApprovals = approvals.map(a => {
          const row = a.toJSON();
        
          const originalUser = row?.setting?.approver || null;
          const latestOverride = row?.overrides?.[0] || null;
          const overrideUser = latestOverride?.user || null;
        
          return {
        
            order: row?.setting?.order ?? null,
            approver_id: originalUser?.id ?? null,
            description: row.setting?.description,
        
            id: row.id,
            status: row.status,
            signed_at: row.signed_at,
            is_overide: row.is_overide,
        
            original_approver_name: getEmployeeName(originalUser),
            original_approver_position: getEmployeePosition(originalUser),
            original_signature: getSignature(originalUser),
        
            override_name: overrideUser ? getEmployeeName(overrideUser) : null,
            override_position: overrideUser ? getEmployeePosition(overrideUser) : null,
            override_signature: overrideUser ? getSignature(overrideUser) : null,
        
            // optional: quick flag
            is_overide: row.is_overide === true
          };
        });

        // 3️⃣ Combine vacancy + approvals
        const result = {
            ...leave.toJSON(),
            approvals: mappedApprovals
        };

        res.json({ result });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

const getEmployeeName = (user) => {
  const emp = user?.employeeAccount?.employee;
  if (!emp) return '';

  const first = emp.first_name || emp.firstName || '';
  const middleRaw = emp.middle_name || emp.middleName || '';
  const last = emp.last_name || emp.lastName || '';
  const suffix = emp.suffix || '';

  const middleInitial = middleRaw
    ? `${middleRaw.trim().charAt(0).toUpperCase()}.`
    : '';

  return [first, middleInitial, last, suffix]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getSignature = (user) => {
    const mime = "image/png";
    const sign = user?.employeeAccount?.employee?.signature;
    return `data:${mime};base64,${sign.signature.toString("base64")}`
};

const getEmployeePosition = (user) => {
  return (
    user?.employeeAccount?.employee?.employment?.position?.name ||
    user?.employeeAccount?.employee?.employment?.position?.title ||
    ''
  );
};


exports.GetEmployee = async (req, res) => {
    try {
        const data = await db.Employee.findAll();
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

exports.GetLeaveType = async (req, res) => {
    try {
        const data = await db.LeaveType.findAll({
            where: {
                is_active: true
            }
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
        employeeid,
        typeid,
        datestart,
        dateend,
        reason
    } = req.body;

    try {
        //control no
        const year = new Date().getFullYear().toString();
        const latest = await db.EmployeeLeaveApplication.findOne({
            where: { 
                control_no: { 
                    [Op.like]: `${year}-%` 
                } 
            },
            order: [['control_no', 'DESC']]
        });
        let nextSeq = 1;

        if (latest) {
            const lastSeq = parseInt(latest.control_no.split('-')[1]);
            nextSeq = lastSeq + 1;
        }
        const newNo = `${year}-${String(nextSeq).padStart(3, '0')}`;
        
        // get employee userid
        const account = await db.EmployeeAccount.findOne({
            employee_id: employeeid
        });

        // save leave
        const leave = await db.EmployeeLeaveApplication.create({
            employee_id: employeeid,
            control_no: newNo,
            leave_type_id: typeid,
            date_from: datestart,
            date_to: dateend,
            reason,
            status: 'Filed'
        });

        // Fetch approval settings by document type
        const signatories = await db.ApprovalSetting.findAll({
            where: {
                owner_id: account.user_id,
                type: 'Leave',
                is_active: true
            },
            order: [['order', 'ASC']]
        });

        for (const sig of signatories) {

            await db.Approval.create({
                setting_id: sig.id,
                document_id: leave.id,
                status: 'Pending',
                signed_at: null,
                remarks: null,
                is_active: true
            });
        }

        res.status(201).json({
            message: "Record Saved!"
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Approve = async (req, res) => {

    const { 
        id
    } = req.params;
    const { approvalid } = req.body;

    try {

        // 1️⃣ Fetch the leave application
        const leave = await db.EmployeeLeaveApplication.findByPk(id, {
            include: [{ model: db.LeaveType, as: 'leaveType' }]
        });

        if (!leave) {
            return res.status(404).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "id",
                    location: "body",
                }],
            });
        }

        // 2️⃣ Update the specific approval record
        const approval = await db.Approval.findByPk(approvalid);
        if (!approval) {
            return res.status(404).json({ error: "Approval record not found!" });
        }

        await approval.update({ status: 'Approved', signed_at: new Date() });

        const totalCount = await db.Approval.count({
            include: [
                {
                    model: db.ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Leave'
                    }
                }
            ],
            where: {
                document_id: id,
                is_active: true
            }
        });

        const approvedCount = await db.Approval.count({
            include: [
                {
                    model: db.ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Leave'
                    }
                }
            ],
            where: {
                document_id: id,
                is_active: true,
                status: 'Approved'
            }
        });

        if (totalCount === approvedCount) {
            await leave.update({ status: 'Approved' });

            const holidays = await db.Holiday.findAll({
                where: {
                    date: { [Op.between]: [leave.date_from, leave.date_to] },
                    isActive: true
                }
            });

            const holidayDates = holidays.map(h => moment(h.date).format('YYYY-MM-DD'));

            // 5️⃣ Compute leave days excluding weekends and holidays
            const start = moment(leave.date_from);
            const end = moment(leave.date_to);
            let daysUsed = 0;

            while (start.isSameOrBefore(end)) {
                const dayOfWeek = start.day(); // 0 = Sunday, 6 = Saturday
                const formatted = start.format('YYYY-MM-DD');

                if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(formatted)) {
                    daysUsed += 1;
                }

                start.add(1, 'day');
            }

            // 6️⃣ Update EmployeeLeaveBalance
            const leaveBalance = await db.EmployeeLeaveBalance.findOne({
                where: {
                    employee_id: leave.employee_id,
                    leave_type_id: leave.leave_type_id,
                    is_active: true
                }
            });

            if (!leaveBalance) {
                return res.status(400).json({ error: "Leave balance not found for employee!" });
            }

            const newUsed = parseFloat(leaveBalance.used) + daysUsed;
            const newBalance = parseFloat(leaveBalance.earned) - newUsed;

            await leaveBalance.update({
                used: newUsed,
                balance: newBalance
            });
        }

        res.status(201).json({
            message: "Record Updated!"
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.Overide = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { signatories } = req.body; // [2, 3]

    const transaction = await sequelize.transaction();

    try {
        // ---- validate payload ----
        if (!Array.isArray(signatories) || signatories.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
            message: 'No signatories provided'
        });
        }

        const approvalIds = [...new Set(
            signatories
                .map(id => Number(id))
                .filter(id => Number.isInteger(id) && id > 0)
        )];

        if (approvalIds.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
            message: 'Invalid signatories payload'
        });
        }

        // ---- fetch approvals (must belong to same document) ----
        const approvals = await db.Approval.findAll({
        where: {
            id: approvalIds,
            is_active: true
        },
        transaction
        });

        if (approvals.length === 0) {
        await transaction.rollback();
        return res.status(404).json({
            message: 'No approvals found to override'
        });
        }

        // ---- update approvals as overridden ----
        await db.Approval.update(
        {
            status: 'Approved',
            is_overide: true,
            signed_at: new Date()
        },
        {
            where: { id: approvalIds }
        }
        );

        // ---- save override history ----
        await db.ApprovalOveride.bulkCreate(
        approvalIds.map(id => ({
            approval_id: id,
            user_id: req.user.id
        }))
        );

        const leave = await db.EmployeeLeaveApplication.findByPk(id);

        const totalCount = await db.Approval.count({
            include: [
                {
                    model: db.ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Leave'
                    }
                }
            ],
            where: {
                document_id: id,
                is_active: true
            }
        });

        const approvedCount = await db.Approval.count({
            include: [
                {
                    model: db.ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Leave'
                    }
                }
            ],
            where: {
                document_id: id,
                is_active: true,
                status: 'Approved'
            }
        });

        // 4️⃣ If all approvals done, approve vacancy + approve position
        if (totalCount === approvedCount) {
           await leave.update({ status: 'Approved' });

            const holidays = await db.Holiday.findAll({
                where: {
                    date: { [Op.between]: [leave.date_from, leave.date_to] },
                    isActive: true
                }
            });

            const holidayDates = holidays.map(h => moment(h.date).format('YYYY-MM-DD'));

            // 5️⃣ Compute leave days excluding weekends and holidays
            const start = moment(leave.date_from);
            const end = moment(leave.date_to);
            let daysUsed = 0;

            while (start.isSameOrBefore(end)) {
                const dayOfWeek = start.day(); // 0 = Sunday, 6 = Saturday
                const formatted = start.format('YYYY-MM-DD');

                if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(formatted)) {
                    daysUsed += 1;
                }

                start.add(1, 'day');
            }

            // 6️⃣ Update EmployeeLeaveBalance
            const leaveBalance = await db.EmployeeLeaveBalance.findOne({
                where: {
                    employee_id: leave.employee_id,
                    leave_type_id: leave.leave_type_id,
                    is_active: true
                }
            });

            if (!leaveBalance) {
                return res.status(400).json({ error: "Leave balance not found for employee!" });
            }

            const newUsed = parseFloat(leaveBalance.used) + daysUsed;
            const newBalance = parseFloat(leaveBalance.earned) - newUsed;

            await leaveBalance.update({
                used: newUsed,
                balance: newBalance
            });
        }

        return res.status(200).json({
        message: 'Approval overridden successfully'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
        message: 'Failed to override approval',
        error: error.message
        });
    }
};

exports.Cancel = async (req, res) => {
    const { 
        id 
    } = req.params;

    const transaction = await db.sequelize.transaction();

    try {
        const leave = await db.EmployeeLeaveApplication.findByPk(id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!leave) {
            await transaction.rollback();
            return res.status(500).json({
                errors: [
                {
                    type: "field",
                    value: id,
                    msg: "Record not found!",
                    path: "name",
                    location: "body",
                },
                ],
            });
        }

        // If already cancelled, just return OK (idempotent)
        if (leave.status === "Cancelled") {
            await transaction.commit();
            return res.status(200).json({ message: "Record already cancelled." });
        }

        // Only restore leave balance if it was previously Approved
        if (leave.status === "Approved") {
            // Compute applied leave days (inclusive)
            // NOTE: This counts ALL calendar days. If you want to exclude weekends/holidays,
            // tell me your rules and we’ll adjust.
            const from = moment(leave.date_from, "YYYY-MM-DD", true);
            const to = moment(leave.date_to, "YYYY-MM-DD", true);

            if (!from.isValid() || !to.isValid() || to.isBefore(from, "day")) {
                await transaction.rollback();
                return res.status(400).json({ error: "Invalid leave date range." });
            }

            const appliedDays = to.diff(from, "days") + 1; // inclusive

            // Get leave balance row (lock it to avoid race conditions)
            const bal = await db.EmployeeLeaveBalance.findOne({
                where: {
                    employee_id: leave.employee_id,
                    leave_type_id: leave.leave_type_id,
                    is_active: true,
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!bal) {
                await transaction.rollback();
                    return res.status(400).json({
                    error: "Leave balance record not found for this employee and leave type.",
                });
            }

            const used = parseFloat(bal.used || 0);
            const balance = parseFloat(bal.balance || 0);

            // Restore: used goes down, balance goes up
            // Guard: used should not go negative even if data is inconsistent
            const newUsed = Math.max(0, used - appliedDays);
            const newBalance = balance + appliedDays;

            await bal.update(
                {
                    used: newUsed,
                    balance: newBalance,
                },
                { transaction }
            );
        }

        // Finally cancel the leave application
        await leave.update(
            {
                status: "Cancelled",
            },
            { transaction }
        );

        await transaction.commit();

        return res.status(200).json({
            message:
                leave.status === "Approved"
                ? "Record Cancelled! Leave balance restored."
                : "Record Cancelled!",
        });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ error: error.message });
    }
};




exports.GenerateLeavePDF = async (req, res) => {

    const { id } = req.params;
    let browser;

    try {
        // 1️⃣ Get leave application
        const leaveApp = await db.EmployeeLeaveApplication.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: db.Employee,
                    as: 'employee',
                    include: [
                        {
                            model: db.Employment,
                            as: 'employment',
                            include: [
                                { 
                                    model: db.Position, 
                                    as: 'position' ,
                                    include: [
                                        { 
                                            model: db.Department, 
                                            as: 'department', 
                                            attributes: ['name'] 
                                        },
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: db.LeaveType,
                    as: 'leaveType',
                    attributes: ['id', 'name', 'credit']
                }
            ]
        });

        if (!leaveApp) {
            return res.status(404).json({ message: 'Leave application not found' });
        }

        const employee = leaveApp.employee;
        const employment = employee.employment;

        // 2️ Format employee info
        const controlNo = leaveApp.control_no;
        const name = [
            employee.first_name,
            employee.middle_name ? `${employee.middle_name.charAt(0)}.` : '',
            employee.last_name,
            employee.suffix || ''
        ].join(' ').replace(/\s+/g, ' ').trim();
        
        const departmentPosition = `${employment?.position?.department?.name || ''} - ${employment?.position?.name || ''}`;
        const contactNo = employee.contact_number || '';

        const dateFiled = moment(leaveApp.createdAt).format('MMMM DD, YYYY');
        const reason = leaveApp.reason;
        const status = leaveApp.status;

        // 3️⃣ Leave date range
        const leaveStart = moment(leaveApp.date_from).format('MMMM DD, YYYY');
        const leaveEnd = moment(leaveApp.date_to).format('MMMM DD, YYYY');
        const totalDays = moment(leaveApp.date_to).diff(moment(leaveApp.date_from), 'days') + 1;

        // 4️⃣ All leave types (checkbox-style display)
        const leaveTypes = await db.LeaveType.findAll({
            attributes: ['id', 'name']
        });

        const formattedLeaveTypes = leaveTypes.map(lt => ({
            ...lt.toJSON(),
            active: lt.id === leaveApp.leave_type_id
        }));

        // 5️⃣ Leave balances of employee
        const leaveBalances = await db.EmployeeLeaveBalance.findAll({
            where: {
                employee_id: employee.id,
                is_active: true
            },
            include: [
                {
                    model: db.LeaveType,
                    as: 'leaveType',
                    attributes: ['name']
                }
            ]
        });

        const balance = leaveBalances.map(lb => ({
            leaveType: lb.leaveType?.name,
            earned: Number(lb.earned),
            used: Number(lb.used),
            balance: Number(lb.balance)
        }));

        // approvals
        const approvals = await db.Approval.findAll({
          where: {
            document_id: id,
            is_active: true
          },
          include: [
            {
              model: db.ApprovalSetting,
              as: 'setting',
              where: { type: 'Leave' },
              include: [
                {
                  model: db.User,
                  as: 'approver',
                  attributes: ['id'],
                  include: [
                    {
                      model: db.EmployeeAccount,
                      as: 'employeeAccount',
                      include: [
                        {
                          model: db.Employee,
                          as: 'employee',
                          include: [
                            {
                              model: db.Employment,
                              as: 'employment',
                              include: [{ model: db.Position, as: 'position' }]
                            },
                            { model: db.EmployeeSignature, as: 'signature' }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              model: db.ApprovalOveride,
              as: 'overrides',
              required: false,
              include: [
                {
                  model: db.User,
                  as: 'user',
                  attributes: ['id'],
                  include: [
                    {
                      model: db.EmployeeAccount,
                      as: 'employeeAccount',
                      include: [
                        {
                          model: db.Employee,
                          as: 'employee',
                          include: [
                            {
                              model: db.Employment,
                              as: 'employment',
                              include: [{ model: db.Position, as: 'position' }]
                            },
                            { model: db.EmployeeSignature, as: 'signature' }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ],
          order: [
            [{ model: db.ApprovalSetting, as: 'setting' }, 'order', 'ASC'],
            [{ model: db.ApprovalOveride, as: 'overrides' }, 'createdAt', 'DESC'] // newest override first
          ]
        });

        // Map approvals to the desired format
        const mappedApprovals = approvals.map(a => {
                    const row = a.toJSON();
        
                    const originalUser = row?.setting?.approver || null;
                    const latestOverride = row?.overrides?.[0] || null;
                    const overrideUser = latestOverride?.user || null;
                    const isApproved = row?.status === 'Approved';
        
                    return {
        
                        description: row.setting?.description,
                        approver: row.is_overide ? getEmployeeName(overrideUser) : getEmployeeName(originalUser),
                        position: row.is_overide ? getEmployeePosition(overrideUser) : getEmployeePosition(originalUser),
                        signature: row.is_overide ? getSignature(overrideUser) : getSignature(originalUser),
                        date: isApproved ? moment(row?.signed_at).format('MMMM DD, YYYY hh:mm A') : null,
                        isSigned: isApproved,
                        isOveride: row.is_overide
                    };
                    });

        // 6️⃣ Render PDF
        const templatePath = path.join(__dirname, '../templates/reports/Leave.pug');
        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const html = pug.renderFile(templatePath, {
            seal,
            controlNo,
            name,
            departmentPosition,
            contactNo,
            dateFiled,
            leaves: formattedLeaveTypes,
            reason,
            status,
            leaveStart,
            leaveEnd,
            totalDays,
            balance,
            signatories: mappedApprovals
        });

        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome',
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('print');

        const pdfBuffer = await page.pdf({
            width: '8.5in',
            height: '11in',
            margin: {
                top: '25px',
                bottom: '25px',
                left: '25px',
                right: '25px'
            },
            printBackground: true
        });
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
};


