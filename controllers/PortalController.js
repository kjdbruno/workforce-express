process.env.TZ = 'Asia/Manila'
const { Op } = require("sequelize");
const crypto = require('crypto');

const pug = require('pug');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment');
const transporter = require('../utils/mailer');

const db = require('../models');
const { sequelize } = db;

function euclideanDistance(d1, d2) {
  return Math.sqrt(
    d1.reduce((sum, val, i) => sum + Math.pow(val - d2[i], 2), 0)
  );
}

const sha256File = (filePath) =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = require('fs').createReadStream(filePath)
    stream.on('data', d => hash.update(d))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })


// exports.TimeIn = async (req, res) => {
//   try {
//     const file = req.file
//     if (!file) return res.status(400).json({ error: 'photo is required' })

//     const descriptor = JSON.parse(req.body.descriptor || '[]')
//     const geo_lat = req.body.geo_lat ? Number(req.body.geo_lat) : null
//     const geo_lng = req.body.geo_lng ? Number(req.body.geo_lng) : null

//     const camera_id = req.body.camera_id || 'unknown-camera'
//     const device_id = req.body.device_id || 'unknown-device'
//     const source = req.body.source || 'Web'
//     const captured_at = req.body.captured_at ? new Date(req.body.captured_at) : new Date()

//     const image_path = `/uploads/logs/${file.filename}`

//     // Compute hashes on server (recommended)
//     const image_hash = await sha256File(file.path)

//     const payloadForHash = {
//       descriptor, geo_lat, geo_lng, camera_id, device_id, source,
//       captured_at: captured_at.toISOString(),
//       image_hash
//     }
//     const payload_hash = crypto.createHash('sha256').update(JSON.stringify(payloadForHash)).digest('hex')

//     // TODO: your existing face matching logic here:
//     // const { match, employee, distance, liveness_passed } = await matchFace(descriptor, ...)
//     // Example placeholders:
//     const match = true
//     const employee = { id: 1 } // replace with matched employee
//     const distance = 0.33
//     const liveness_passed = true

//     // Convert distance to score (0..1)
//     const recognition_score = Math.max(0, Math.min(1, 1 - Number(distance || 0)))

//     const now = new Date();
//     // Save log
//     await db.EmployeeLog.create({
//       employee_id: employee.id,
//       captured_at: now,
//       recognition_score,
//       liveness_passed,
//       camera_id,
//       device_id,
//       source,
//       geo_lat: geo_lat ?? 0,
//       geo_lng: geo_lng ?? 0,
//       image_path,
//       image_hash,
//       payload_hash
//     })

//     return res.json({
//       match,
//       employee,
//       distance,
//       liveness_passed,
//       dtr: { date: new Date().toISOString().slice(0,10), time: new Date().toTimeString().slice(0,8) }
//     })
//   } catch (err) {
//     console.error(err)
//     return res.status(500).json({ error: err.message })
//   }
// }


exports.ScanBiometric = async (req, res) => {
    try {
        const file = req.file
        if (!file) return res.status(400).json({ error: 'photo is required' })

        const descriptor = JSON.parse(req.body.descriptor || '[]')
        const geo_lat = req.body.geo_lat ? Number(req.body.geo_lat) : null
        const geo_lng = req.body.geo_lng ? Number(req.body.geo_lng) : null

        const camera_id = req.body.camera_id || 'unknown-camera'
        const device_id = req.body.device_id || 'unknown-device'
        const source = req.body.source || 'Web'
        const now = moment().format('YYYY-MM-DD HH:mm:ss')

        const image_path = `/uploads/logs/${file.filename}`

        const image_hash = await sha256File(file.path)

        const payloadForHash = {
            descriptor,
            geo_lat,
            geo_lng,
            camera_id,
            device_id,
            source,
            captured_at: now,
            image_hash
        }

        const payload_hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(payloadForHash))
            .digest('hex')

        const faces = await db.EmployeeFace.findAll()

        let bestMatch = null
        let minDistance = Infinity

        for (const face of faces) {
            const stored = JSON.parse(face.descriptor)
            const dist = euclideanDistance(descriptor, stored)

            if (dist < minDistance) {
                minDistance = dist
                bestMatch = face
            }
        }

        if (!bestMatch || minDistance > 0.6) {
            return res.json({ match: false })
        }

        const employee = await db.Employee.findOne({
            include: [
                {
                    model: db.Employment,
                    as: 'employment',
                    include: [
                        {
                            model: db.Position,
                            as: 'position'
                        }
                    ]
                }
            ],
            where: { id: bestMatch.employee_id }
        })

        if (!employee) {
            return res.status(404).json({
                match: false,
                message: 'Employee not found'
            })
        }

        // ✅ compute recognition_score AFTER distance is known
        const recognition_score = Math.max(
            0,
            Math.min(1, 1 - Number(minDistance))
        )

        // ✅ automatically true (for now)
        const liveness_passed = true

        const log = await db.EmployeeLog.create({
            employee_id: employee.id,
            captured_at: now,
            recognition_score,
            liveness_passed,
            camera_id,
            device_id,
            source,
            geo_lat: geo_lat ?? 0,
            geo_lng: geo_lng ?? 0,
            image_path,
            image_hash,
            payload_hash
        })

        return res.json({
            match: true,
            employee,
            log,
            distance: minDistance,
            recognition_score,
            liveness_passed
        })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: err.message })
    }
}


exports.ScanFace = async (req, res) => {
    try {
        const { descriptor } = req.body;

        const faces = await db.EmployeeFace.findAll();

        let bestMatch = null;
        let minDistance = Infinity;

        for (const face of faces) {
            const stored = JSON.parse(face.descriptor);
            const dist = euclideanDistance(descriptor, stored);

            if (dist < minDistance) {
                minDistance = dist;
                bestMatch = face;
            }
        }

        if (!bestMatch || minDistance > 0.6) {
            return res.json({ match: false });
        }

        const employee = await db.Employee.findOne({
            include: [
                {
                    model: db.Employment,
                    as: 'employment',
                    include: [
                        {
                            model: db.Position,
                            as: 'position'
                        }
                    ]
                },
                {
                    model: db.EmployeePhoto,
                    as: 'photo'
                }
            ],  
            where: {
                id: bestMatch.employee_id
            }
        });

        const mime = "image/png";
        // ✅ map only what you want
        const record = {
            id: employee.id,
            photo: `data:${mime};base64,${employee.photo.avatar.toString("base64")}`,
            employee_no: employee.employment?.employee_no,
            first_name: employee.first_name,
            middle_name: employee.middle_name,
            last_name: employee.last_name,
            suffix: employee.suffix,
            position: employee.employment.position.name,
            employment_status: employee.employment.employment_status
        };

        res.json({
            match: true,
            record,
            distance: minDistance,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
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

exports.CreateLeave = async (req, res) => {

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
            control_no: newNo,
            employee_id: employeeid,
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

            const isFirstApprover = sig.order === 1;

            await db.Approval.create({
                setting_id: sig.id,
                document_id: leave.id,
                status: isFirstApprover ? 'Approved' : 'Pending',
                signed_at: isFirstApprover ? new Date() : null,
                remarks: isFirstApprover ? 'Auto-approved (owner is first approver)' : null,
                is_active: true
            });
        }

        // send email
        const lt = await db.LeaveType.findByPk(typeid)
        const employee = await db.Employee.findByPk(employeeid);
        const mail = employee?.email;
        const control_no = leave?.control_no;
        const firstname = employee?.first_name;
        const leavetype = lt?.name;
        const from = moment(leave?.date_from).format('MMMM DD YYYY');
        const to = moment(leave?.date_to).format('MMMM DD YYYY');
        const lreason = leave?.reason;
        try {
            const templatePath = path.join(__dirname, '../templates/LeaveApplication.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');
            htmlContent = htmlContent
            .replace(/{{\s*control_no\s*}}/g, control_no || 'Control No')
            .replace(/{{\s*firstname\s*}}/g, firstname || 'Applicant')
            .replace(/{{\s*leavetype\s*}}/g, leavetype || 'Leave')
            .replace(/{{\s*from\s*}}/g, from || 'Date From')
            .replace(/{{\s*to\s*}}/g, to || 'Date To')
            .replace(/{{\s*lreason\s*}}/g, lreason || 'Reason')

            await transporter.sendMail({
                from: `"Centurion Management Collection Inc." <${process.env.MAIL_USER}>`,
                to: mail,
                subject: 'Leave Application',
                html: htmlContent,
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
        }

        res.status(201).json({
            message: "Record Saved!",
            leave
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.GetLeave = async (req, res) => {

    const { controlno } = req.params;

    try {
        
        const leave = await db.EmployeeLeaveApplication.findOne({
            where: { 
                control_no: controlno 
            },
            include: [
                {
                    model: db.Employee,
                    as: 'employee',
                },
                {
                    model: db.LeaveType,
                    as: 'leaveType',
                    attributes: [
                        'name'
                    ]
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

exports.Approve = async (req, res) => {

    const { 
        id,
        approverId: approvalid
    } = req.params;

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

exports.GenerateLeavePDF = async (req, res) => {

    const { id } = req.params;
    let browser;

    try {
        // 1️ Get leave application
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
                                    as: 'position',
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
            return res.status(404).json({
                message: 'Leave application not found'
            })
        }

        const employee = leaveApp.employee;
        const employment = employee.employment;

        // 2️⃣ Format employee info
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
            document_id: leaveApp.id,
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

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
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