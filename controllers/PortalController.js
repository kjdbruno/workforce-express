process.env.TZ = 'Asia/Manila'
const { Op } = require("sequelize");
const crypto = require('crypto');

const pug = require('pug');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
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


// exports.ScanBiometric = async (req, res) => {
//     try {
//         const file = req.file
//         if (!file) return res.status(400).json({ error: 'photo is required' })

//         const descriptor = JSON.parse(req.body.descriptor || '[]')
//         const geo_lat = req.body.geo_lat ? Number(req.body.geo_lat) : null
//         const geo_lng = req.body.geo_lng ? Number(req.body.geo_lng) : null

//         const camera_id = req.body.camera_id || 'unknown-camera'
//         const device_id = req.body.device_id || 'unknown-device'
//         const source = req.body.source || 'Web'
//         const now = moment().format('YYYY-MM-DD HH:mm:ss')

//         const image_path = `/uploads/logs/${file.filename}`

//         const image_hash = await sha256File(file.path)

//         const payloadForHash = {
//             descriptor,
//             geo_lat,
//             geo_lng,
//             camera_id,
//             device_id,
//             source,
//             captured_at: now,
//             image_hash
//         }

//         const payload_hash = crypto
//             .createHash('sha256')
//             .update(JSON.stringify(payloadForHash))
//             .digest('hex')

//         const faces = await db.EmployeeFace.findAll()

//         let bestMatch = null
//         let minDistance = Infinity

//         for (const face of faces) {
//             const stored = JSON.parse(face.descriptor)
//             const dist = euclideanDistance(descriptor, stored)

//             if (dist < minDistance) {
//                 minDistance = dist
//                 bestMatch = face
//             }
//         }

//         if (!bestMatch || minDistance > 0.6) {
//             return res.json({ match: false })
//         }

//         const employee = await db.Employee.findOne({
//             include: [
//                 {
//                     model: db.Employment,
//                     as: 'employment',
//                     include: [
//                         {
//                             model: db.Position,
//                             as: 'position'
//                         }
//                     ]
//                 }
//             ],
//             where: { id: bestMatch.employee_id }
//         })

//         if (!employee) {
//             return res.status(404).json({
//                 match: false,
//                 message: 'Employee not found'
//             })
//         }

//         // ✅ compute recognition_score AFTER distance is known
//         const recognition_score = Math.max(
//             0,
//             Math.min(1, 1 - Number(minDistance))
//         )

//         // ✅ automatically true (for now)
//         const liveness_passed = true

//         const log = await db.EmployeeLog.create({
//             employee_id: employee.id,
//             captured_at: now,
//             recognition_score,
//             liveness_passed,
//             camera_id,
//             device_id,
//             source,
//             geo_lat: geo_lat ?? 0,
//             geo_lng: geo_lng ?? 0,
//             image_path,
//             image_hash,
//             payload_hash
//         })

//         return res.json({
//             match: true,
//             employee,
//             log,
//             distance: minDistance,
//             recognition_score,
//             liveness_passed
//         })

//     } catch (err) {
//         console.error(err)
//         return res.status(500).json({ error: err.message })
//     }
// }

// Euclidean distance between two descriptor arrays (same math face-api uses internally)
// const euclideanDistance = (a, b) => {
//     let sum = 0;
//     for (let i = 0; i < a.length; i++) {
//         const diff = a[i] - b[i];
//         sum += diff * diff;
//     }
//     return Math.sqrt(sum);
// };

// Distance threshold — same scale face-api uses (~0.5–0.6 typical for "same person")
const MATCH_THRESHOLD = 0.55;

exports.ScanBiometric = async (req, res) => {
    try {
        const {
            descriptor,
            geo_lat,
            geo_lng,
            camera_id,
            device_id,
            image_hash,
            payload_hash,
            source,
            captured_at,
        } = req.body;

        if (!descriptor) {
            return res.status(400).json({ message: "Descriptor is required." });
        }

        let incomingDescriptor;
        try {
            incomingDescriptor = JSON.parse(descriptor);
        } catch {
            return res.status(400).json({ message: "Invalid descriptor format." });
        }

        // Pull every enrolled face record
        const allFaces = await db.EmployeeFace.findAll({
            include: [{ model: db.Employee, as: 'employee' }] // adjust alias to your association
        });

        let bestMatch = null;
        let bestDistance = Infinity;

        for (const face of allFaces) {
            // Prefer matching against every raw sample (more robust across devices);
            // fall back to the single averaged descriptor if samples aren't present
            let candidateDescriptors = [];
            try {
                candidateDescriptors = face.samples
                    ? JSON.parse(face.samples)
                    : [JSON.parse(face.descriptor)];
            } catch {
                continue; // skip corrupted rows rather than crash the whole scan
            }

            for (const sample of candidateDescriptors) {
                const distance = euclideanDistance(incomingDescriptor, sample);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = face;
                }
            }
        }

        const isMatch = bestMatch && bestDistance <= MATCH_THRESHOLD;

        if (!isMatch) {
            return res.status(200).json({
                match: false,
                distance: bestDistance === Infinity ? null : bestDistance,
                liveness_passed: true, // liveness already validated client-side before this call
            });
        }

        // Create the time-in/time-out log entry
        const log = await db.EmployeeLog.create({
            employee_id: bestMatch.employee_id,
            geo_lat: geo_lat || null,
            geo_lng: geo_lng || null,
            camera_id: camera_id || null,
            device_id: device_id || null,
            image_hash: image_hash || null,
            payload_hash: payload_hash || null,
            source: source || 'Web',
            captured_at: captured_at ? new Date(captured_at) : new Date(),
        });

        return res.status(201).json({
            match: true,
            employee: bestMatch.employee, // { first_name, middle_name, last_name, ... }
            log: { captured_at: log.captured_at },
            distance: bestDistance,
            liveness_passed: true,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

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
                },
                {
                    model: db.EmployeeAccount,
                    as: 'account',
                    include: [
                        {
                            model: db.User,
                            as: 'user',
                            where: {
                                role: 'Employee'
                            }
                        }
                    ]
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
            employment_status: employee.employment.employment_status,
            user: employee.account
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
    const employeeId = req.query.employeeid;
    try {
        const data = await db.LeaveType.findAll({
            where: {
                is_active: true
            },
            include: [
                {
                    model: db.EmployeeLeaveBalance,
                    as: 'balances',
                    attributes: [
                        'balance'
                    ],
                    where: {
                        employee_id: employeeId
                    }
                }
            ]
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
        // check leave balance
        const leaveBalance = await db.EmployeeLeaveBalance.findOne({
            where: {
                employee_id: employeeid,
                leave_type_id: typeid,
                is_active: true
            }
        });
        if (!leaveBalance) {
            return res.status(404).json({
                errors: [{
                    type: "field",
                    value: employeeid,
                    msg: "Leave balance not found for employee!",
                    path: "id",
                    location: "body",
                }],
            });
        }
        // Validate date range
        if (moment(datestart).isAfter(moment(dateend))) {
            return res.status(400).json({
                errors: [{ msg: "Invalid date range!" }],
            });
        }
        // Get holidays
        const holidays = await db.Holiday.findAll({
            where: {
                date: { [Op.between]: [datestart, dateend] },
                isActive: true
            }
        });

        const holidayDates = holidays.map(h => moment(h.date).format('YYYY-MM-DD'));

        // Compute leave days
        const start = moment(datestart);
        const end = moment(dateend);

        let daysRequested = 0;

        while (start.isSameOrBefore(end)) {
            const day = start.day();
            const formatted = start.format('YYYY-MM-DD');

            if (day !== 0 && day !== 6 && !holidayDates.includes(formatted)) {
                daysRequested++;
            }

            start.add(1, 'day');
        }

        // Prevent zero-day leave
        if (daysRequested === 0) {
            return res.status(400).json({
                errors: [{ msg: "No valid leave days selected!" }],
            });
        }

        // Check balance
        const availableBalance = parseFloat(leaveBalance.balance);

        if (daysRequested > availableBalance) {
            return res.status(400).json({
                errors: [{
                    msg: `Insufficient leave balance! Available: ${availableBalance}, Requested: ${daysRequested}`
                }],
            });
        }

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
            where: {
                employee_id: employeeid
            }
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

exports.GetAllLeave = async (req, res) => {

    const id = parseInt(req.query.id);
    
    const month = req.query.month;
    const year = req.query.year;

    const startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');

    try {

        const rows = await db.EmployeeLeaveApplication.findAll({
            include: [
                {
                    model: db.LeaveType,
                    as: 'leaveType'
                }
            ],
            where: {
                employee_id: id,
                [Op.and]: [
                    { date_from: { [Op.lte]: endDate } }, // leave starts before or on endOfMonth
                    { date_to: { [Op.gte]: startDate } }  // leave ends after or on startOfMonth
                ]
            },
            order: [['date_from', 'DESC']]
        });

        res.json({
            record: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.GetLeave = async (req, res) => {

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

        // check leave balance
        const leaveBalance = await db.EmployeeLeaveBalance.findOne({
            where: {
                employee_id: leave.employee_id,
                leave_type_id: leave.leave_type_id,
                is_active: true
            }
        });

        if (!leaveBalance) {
            return res.status(404).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Leave balance not found for employee!",
                    path: "id",
                    location: "body",
                }],
            });
        }

        // 2️⃣ Update the specific approval record
        const approval = await db.Approval.findByPk(approvalid);
        if (!approval) {
            return res.status(404).json({
                errors: [{
                    type: "field",
                    value: id,
                    msg: "Approval record not found!",
                    path: "id",
                    location: "body",
                }],
            });
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
            // executablePath: '/usr/bin/google-chrome',
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
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

/**
 * 
 * 
 * 
 * 
 * DTR LOGS
 * 
 * 
 * 
 * 
 * 
 */
exports.GetLog = async (req, res) => {
    const id = parseInt(req.query.id, 10)
    const month = Number(req.query.month)
    const year = Number(req.query.year)

    try {
        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' })
        }

        // Build date range
        const startDate = moment({ year, month: month - 1 }).startOf('month').format('YYYY-MM-DD HH:mm:ss')
        const endDate = moment({ year, month: month - 1 }).endOf('month').format('YYYY-MM-DD HH:mm:ss')

        // 1️ Fetch ALL logs for employee in month
        const logs = await db.EmployeeLog.findAll({
            where: {
                employee_id: id,
                captured_at: { [Op.between]: [startDate, endDate] }
            },
            order: [['captured_at', 'ASC']]
        })
        // 2️ Approved leave applications
        const leaves = await db.EmployeeLeaveApplication.findAll({
            where: {
                employee_id: id,
                status: 'Approved',
                date_from: { [Op.lte]: endDate },
                date_to: { [Op.gte]: startDate }
            },
            include: [
                { 
                    model: db.LeaveType, 
                    as: 'leaveType' 
                }
            ]
        })

        // 3️ Holidays
        const holidays = await db.Holiday.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] },
                isActive: true
            }
        })

        // 4️ Approved overtime
        const overtimes = await db.EmployeeOvertimeApplication.findAll({
            where: {
                employee_id: id,
                status: 'Approved'
            },
            include: [
                {
                model: db.Overtime,
                as: 'overtime',
                where: {
                    date: { [Op.between]: [startDate, endDate] },
                    status: 'Approved'
                }
                }
            ]
        })

        // 5️ Build lookup maps
        const leaveMap = {}
        leaves.forEach(leave => {
            let d = moment(leave.date_from)
            const end = moment(leave.date_to)
            while (d.isSameOrBefore(end)) {
                leaveMap[d.format('YYYY-MM-DD')] = leave.leaveType.name
                d.add(1, 'day')
            }
        })

        const holidayMap = {}
        holidays.forEach(h => {
            holidayMap[moment(h.date).format('YYYY-MM-DD')] = h.name
        })

        const overtimeMap = {}
        overtimes.forEach(otApp => {
            const ot = otApp.overtime
            if (!overtimeMap[ot.date]) overtimeMap[ot.date] = []
            overtimeMap[ot.date].push({
                start: moment(ot.timeStart, 'HH:mm:ss').format('h:mm A'),
                end: moment(ot.timeEnd, 'HH:mm:ss').format('h:mm A'),
                description: ot.description
            })
        })

        // 6️ Generate DTR
        const result = []
        let day = moment(startDate)
        const endDay = moment(endDate)

        while (day.isSameOrBefore(endDay)) {
            const dateKey = day.format('YYYY-MM-DD')

            const times = logs
                .filter(l => moment(l.captured_at).format('YYYY-MM-DD') === dateKey)
                .map(l => moment(l.captured_at).format('hh:mm A'))

            const paddedTimes =
                times.length < 4
                    ? [...times, ...Array(4 - times.length).fill('')]
                    : times.slice(0, 4)

            result.push({
                date: dateKey,
                times: paddedTimes,
                leaveType: leaveMap[dateKey] || '',
                holiday: holidayMap[dateKey] || '',
                overtime: overtimeMap[dateKey]?.length ? 'Overtime' : ''
            })

            day.add(1, 'day')
        }

        // 7️ Response
        return res.json({
            employee_id: id,
            month,
            year,
            data: result
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: error.message })
    }
}

exports.GetAllAttendance = async (req, res) => {
    const id = parseInt(req.query.id);
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);

    try {
        if (!month || !year) {
            return res.status(400).json({ error: 'month and year are required' })
        }

        // Month range
        const startDate = moment(`${year}-${String(month).padStart(2, '0')}-01`, "YYYY-MM-DD")
            .startOf("month")
            .format("YYYY-MM-DD")

        const endDate = moment(`${year}-${String(month).padStart(2, '0')}-01`, "YYYY-MM-DD")
            .endOf("month")
            .format("YYYY-MM-DD")

        const rows = await db.Attendance.findAll({
            where: {
                employee_id: id,
                [Op.and]: [
                    { date_from: { [Op.lte]: endDate } },
                    { date_to: { [Op.gte]: startDate } },
                ],
            }
        })

        return res.json({
            result: rows
        })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.GetAttendance = async (req, res) => {
  const { id } = req.params;

  // ✅ Helpers (display only)
  const formatTime = (t) => (t ? moment(t, ["HH:mm:ss", "HH:mm"]).format("HH:mm") : "");
  const formatTimeHHmmA = (t) => (t ? moment(t, ["HH:mm:ss", "HH:mm"]).format("hh:mm A") : "");
  const toNum = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  try {
    // 1️⃣ Attendance period + daily records
    const attendance = await db.Attendance.findOne({
      where: { id },
      include: [
        {
          model: db.EmployeeAttendance,
          as: "days",
          separate: true,
          order: [["work_day", "ASC"]],
        },
      ],
    });

    if (!attendance) return res.status(404).json({ error: "Attendance not found" });

    const startDate = moment(attendance.date_from).format("YYYY-MM-DD");
    const endDate = moment(attendance.date_to).format("YYYY-MM-DD");

    // 1.5 EmployeeShift (kept, though you are not computing in this endpoint)
    const employeeShifts = await db.EmployeeShift.findAll({
      where: { employee_id: attendance.employee_id },
      include: [
        {
          model: db.Shift,
          as: "shift",
          include: [{ model: db.ShiftDay, as: "days" }],
        },
      ],
      order: [["effective_from", "DESC"]],
    });

    // 2️⃣ Leaves
    const leaves = await db.EmployeeLeaveApplication.findAll({
      where: {
        employee_id: attendance.employee_id,
        status: "Approved",
        date_from: { [Op.lte]: endDate },
        date_to: { [Op.gte]: startDate },
      },
      include: [{ model: db.LeaveType, as: "leaveType" }],
    });

    // 3️⃣ Holidays
    const holidays = await db.Holiday.findAll({
      where: {
        date: { [Op.between]: [startDate, endDate] },
        isActive: true,
      },
    });

    // 4️⃣ Overtime apps for NOTES only
    const overtimes = await db.EmployeeOvertimeApplication.findAll({
      where: {
        employee_id: attendance.employee_id,
        status: "Approved",
      },
      include: [
        {
          model: db.Overtime,
          as: "overtime",
          required: true,
          where: {
            date: { [Op.between]: [startDate, endDate] },
            status: "Approved",
          },
        },
      ],
    });

    // 5️⃣ Adjustments (latest first) under this attendance header
    const adjustments = await db.EmployeeAttendanceAdjustment.findAll({
      include: [
        {
          model: db.EmployeeAttendance,
          as: "attendance",
          required: true,
          where: { attendance_id: attendance.id },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 6️⃣ Lookup maps
    const leaveMap = {};
    for (const leave of leaves) {
      let d = moment(leave.date_from);
      const e = moment(leave.date_to);
      while (d.isSameOrBefore(e, "day")) {
        leaveMap[d.format("YYYY-MM-DD")] = leave.leaveType?.name || "";
        d.add(1, "day");
      }
    }

    const holidayMap = {};
    for (const h of holidays) {
      holidayMap[moment(h.date).format("YYYY-MM-DD")] = h.name;
    }

    // overtimeMap for NOTES only
    const overtimeMap = {};
    for (const otApp of overtimes) {
      const ot = otApp.overtime;
      const key = moment(ot.date).format("YYYY-MM-DD");
      if (!overtimeMap[key]) overtimeMap[key] = [];
      overtimeMap[key].push({
        start: ot.time_start ? formatTime(ot.time_start) : "",
        end: ot.time_end ? formatTime(ot.time_end) : "",
        description: ot.description || "",
        status: ot.status,
      });
    }

    // dayMap from EmployeeAttendance
    const dayMap = {};
    for (const d of attendance.days || []) {
      dayMap[moment(d.work_day).format("YYYY-MM-DD")] = d;
    }

    // latest adjustment per employee_attendance_id
    const adjustmentMap = {};
    for (const adj of adjustments) {
      if (!adjustmentMap[adj.employee_attendance_id]) {
        adjustmentMap[adj.employee_attendance_id] = adj; // newest wins
      }
    }

    // 8️⃣ Build results (NO COMPUTATION; base from EmployeeAttendance, override from Adjustment)
    const logs = [];
    let day = moment(startDate, "YYYY-MM-DD");
    const endDay = moment(endDate, "YYYY-MM-DD");

    while (day.isSameOrBefore(endDay, "day")) {
      const formatted = day.format("YYYY-MM-DD");
      const dtr = dayMap[formatted];

      const notes = [];

      if (holidayMap[formatted]) notes.push({ type: "holiday", name: holidayMap[formatted] });
      if (leaveMap[formatted]) notes.push({ type: "leave", name: leaveMap[formatted] });

      if (overtimeMap[formatted]?.length) {
        overtimeMap[formatted].forEach((ot) => {
          notes.push({
            type: "overtime",
            name: `ot (${formatTimeHHmmA(ot.start)} to ${formatTimeHHmmA(ot.end)})`,
          });
        });
      }

      const adjustment = dtr ? adjustmentMap[dtr.id] : null;
      if (adjustment) notes.push({ type: "adjustment", name: adjustment.reason });

      // time source: adjustment wins if present, else EmployeeAttendance
      const originalTimeIn = formatTime(dtr?.time_in);
      const originalTimeOut = formatTime(dtr?.time_out);

      const adjustedTimeIn = adjustment ? formatTime(adjustment.adjusted_time_in) : null;
      const adjustedTimeOut = adjustment ? formatTime(adjustment.adjusted_time_out) : null;

      const finalTimeIn = adjustedTimeIn || originalTimeIn;
      const finalTimeOut = adjustedTimeOut || originalTimeOut;

      // ✅ BASE: EmployeeAttendance minutes
      const baseLate = toNum(dtr?.late_minutes ?? dtr?.late ?? 0, 0);
      const baseUndertime = toNum(dtr?.undertime_minutes ?? dtr?.undertime ?? 0, 0);
      const baseOvertime = toNum(dtr?.overtime_minutes ?? dtr?.overtime ?? 0, 0);

      // ✅ OVERRIDE: EmployeeAttendanceAdjustment computed minutes (your new fields)
      const finalLate =
        adjustment && adjustment.adjusted_late_minutes != null
          ? toNum(adjustment.adjusted_late_minutes, baseLate)
          : baseLate;

      const finalUndertime =
        adjustment && adjustment.adjusted_undertime_minutes != null
          ? toNum(adjustment.adjusted_undertime_minutes, baseUndertime)
          : baseUndertime;

      const finalOvertime =
        adjustment && adjustment.adjusted_overtime_minutes != null
          ? toNum(adjustment.adjusted_overtime_minutes, baseOvertime)
          : baseOvertime;

      logs.push({
        date: formatted,

        attendance_id: dtr?.id || null,
        adjustment_id: adjustment?.id || null,

        time_in: finalTimeIn,
        time_out: finalTimeOut,

        original_time_in: originalTimeIn,
        original_time_out: originalTimeOut,
        adjusted_time_in: adjustedTimeIn,
        adjusted_time_out: adjustedTimeOut,

        // ✅ final values (adjustment overrides base)
        late: finalLate,
        undertime: finalUndertime,
        overtime: finalOvertime,

        notes,
      });

      day.add(1, "day");
    }

    const approvals = await db.Approval.findAll({
              where: {
                document_id: attendance.id,
                is_active: true
              },
              include: [
                {
                  model: db.ApprovalSetting,
                  as: 'setting',
                  where: { type: 'TimeCard' },
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

            res.json({ logs, approvals: mappedApprovals, id: attendance.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.ApproveAttendance = async (req, res) => {

    const { approvalId, attendanceId } = req.body;

    try {

        const attendance = await db.Attendance.findByPk(attendanceId);
        
        if (!attendance) {
            return res.status(500).json({
                errors: [{
                    type: "field",
                    value: attendanceId,
                    msg: "Record not found!",
                    path: "id",
                    location: "body",
                }],
            });
        }

        const approval = await db.Approval.findByPk(approvalId);

        await approval.update({
            status: 'Approved',
            signed_at: new Date()
        })
        
                const totalCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'TimeCard'
                            }
                        }
                    ],
                    where: {
                        document_id: attendanceId,
                        is_active: true
                    }
                });
        
                const approvedCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'TimeCard'
                            }
                        }
                    ],
                    where: {
                        document_id: attendanceId,
                        is_active: true,
                        status: 'Approved'
                    }
                });
        
                if (totalCount === approvedCount) {
                  await attendance.update({ status: 'Approved' });
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

exports.GenerateAttendancePDF = async (req, res) => {
    const { 
        id 
    } = req.params;
    let browser;

    // ✅ Helpers
    const formatTime = (t) => (t ? moment(t, ["HH:mm:ss", "HH:mm"]).format("HH:mm") : "");
    const formatTimeHHmmA = (t) => (t ? moment(t, ["HH:mm:ss", "HH:mm"]).format("hh:mm A") : "");

    try {
        // 1 Attendance period + daily records
        const attendance = await db.Attendance.findOne({
            where: { 
                id 
            },
            include: [
                {
                    model: db.EmployeeAttendance,
                    as: "days",
                    separate: true,
                    order: [["work_day", "ASC"]],
                },
            ],
        });

        if (!attendance) return res.status(404).json({ error: "Attendance not found" });

        const startDate = moment(attendance.date_from).format("YYYY-MM-DD");
        const endDate = moment(attendance.date_to).format("YYYY-MM-DD");

        // 1.5 Fetch EmployeeShift records (effective dating) + Shift + ShiftDays
        // Shift hasMany ShiftDay as 'days' (day_of_week: 1=Mon..7=Sun)
        const employeeShifts = await db.EmployeeShift.findAll({
            where: { 
                employee_id: attendance.employee_id 
            },
            include: [
                {
                    model: db.Shift,
                    as: "shift",
                    include: [
                        { 
                            model: db.ShiftDay, 
                            as: "days" 
                        }
                    ],
                },
            ],
            order: [["effective_from", "DESC"]],
        });

        // 2️ Leaves
        const leaves = await db.EmployeeLeaveApplication.findAll({
            where: {
                employee_id: attendance.employee_id,
                status: "Approved",
                date_from: { [Op.lte]: endDate },
                date_to: { [Op.gte]: startDate },
            },
            include: [
                { 
                    model: db.LeaveType, 
                    as: "leaveType" 
                }
            ],
        });

        // 3️ Holidays
        const holidays = await db.Holiday.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] },
                isActive: true,
            },
        });

        // 4️ Overtime applications (range) for NOTES (fast map)
        const overtimes = await db.EmployeeOvertimeApplication.findAll({
            where: {
                employee_id: attendance.employee_id,
                status: "Approved",
            },
            include: [
                {
                    model: db.Overtime,
                    as: "overtime",
                    required: true,
                    where: {
                        date: { [Op.between]: [startDate, endDate] },
                        status: "Approved",
                    },
                },
            ],
        });

        // 5 Adjustments (latest first)
        const adjustments = await db.EmployeeAttendanceAdjustment.findAll({
            include: [
                {
                    model: db.EmployeeAttendance,
                    as: "attendance",
                    required: true,
                    where: { 
                        attendance_id: attendance.id 
                    },
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        // 6 Lookup maps
        const leaveMap = {};
        for (const leave of leaves) {
            let d = moment(leave.date_from);
            const end = moment(leave.date_to);
            while (d.isSameOrBefore(end)) {
                leaveMap[d.format("YYYY-MM-DD")] = leave.leaveType?.name || "";
                d.add(1, "day");
            }
        }

        const holidayMap = {};
        for (const h of holidays) {
            holidayMap[moment(h.date).format("YYYY-MM-DD")] = h.name;
        }

        // overtimeMap for remarks
        const overtimeMap = {};
        for (const otApp of overtimes) {
            const ot = otApp.overtime;
            const key = moment(ot.date).format("YYYY-MM-DD");
            if (!overtimeMap[key]) overtimeMap[key] = [];
            overtimeMap[key].push({
                start: ot.time_start ? formatTime(ot.time_start) : "",
                end: ot.time_end ? formatTime(ot.time_end) : "",
                description: ot.description || "",
                status: ot.status,
            });
        }

        // dayMap
        const dayMap = {};
        for (const d of attendance.days || []) {
            dayMap[moment(d.work_day).format("YYYY-MM-DD")] = d;
        }

        // latest adjustment per EmployeeAttendance.id
        const adjustmentMap = {};
        for (const adj of adjustments) {
            if (!adjustmentMap[adj.employee_attendance_id]) {
                adjustmentMap[adj.employee_attendance_id] = adj; // newest wins
            }
        }

        // 7 Build results
        const results = [];
        let day = moment(startDate);
        const endDay = moment(endDate);

        while (day.isSameOrBefore(endDay)) {
            const formatted = day.format("YYYY-MM-DD");
            const dtr = dayMap[formatted];

            const notes = [];

            // notes: holiday/leave/overtime(adjusted note)
            if (holidayMap[formatted]) notes.push({ type: "holiday", name: holidayMap[formatted] });
            if (leaveMap[formatted]) notes.push({ type: "leave", name: leaveMap[formatted] });

            if (overtimeMap[formatted]?.length) {
                overtimeMap[formatted].forEach((ot) => {
                    notes.push({
                        type: "overtime",
                        name: `ot (${formatTimeHHmmA(ot.start)} to ${formatTimeHHmmA(ot.end)})`,
                    });
                });
            }

            const adjustment = dtr ? adjustmentMap[dtr.id] : null;
            if (adjustment) notes.push({ type: "adjustment", name: adjustment.reason });

            // time source: latest adjustment OR attendance
            const originalTimeIn = formatTime(dtr?.time_in);
            const originalTimeOut = formatTime(dtr?.time_out);

            const adjustedTimeIn = adjustment ? formatTime(adjustment.adjusted_time_in) : null;
            const adjustedTimeOut = adjustment ? formatTime(adjustment.adjusted_time_out) : null;

            const finalTimeIn = adjustedTimeIn || originalTimeIn;
            const finalTimeOut = adjustedTimeOut || originalTimeOut;

            // Shift for this date (effective dated)
            const effective = pickEffectiveEmployeeShift(employeeShifts, formatted);
            const shift = effective?.shift || null;

            // default computed
            let late = 0;
            let undertime = 0;
            let overtime = 0;

            // compute only if we have shift + actual times + shift day matches
            if (shift && finalTimeIn && finalTimeOut) {
                // shift day validation (1=Mon..7=Sun)
                const shiftDaySet = new Set((shift.days || []).map(sd => Number(sd.day_of_week)));
                const isoDow = moment(formatted, "YYYY-MM-DD").isoWeekday();
                const isShiftDay = shiftDaySet.size ? shiftDaySet.has(isoDow) : true;

                // Scheduled times (rename if your Shift uses different columns)
                const schedInStr = shift.time_in || shift.time_start || shift.timeStart || shift.start_time;
                const schedOutStr = shift.time_out || shift.time_end || shift.timeEnd || shift.end_time;

                const schedStart = combineDayTime(formatted, schedInStr);
                const schedEnd = combineDayTime(formatted, schedOutStr);

                // Actual times (adjustment OR attendance)
                const actualStart = combineDayTime(formatted, finalTimeIn);
                const actualEnd = combineDayTime(formatted, finalTimeOut);

                // guard
                const schedOk = schedStart.isValid() && schedEnd.isValid() && schedEnd.isAfter(schedStart);
                const actualOk = actualStart.isValid() && actualEnd.isValid() && actualEnd.isAfter(actualStart);

                const isHoliday = !!holidayMap[formatted];
                const isLeave = !!leaveMap[formatted];

                if (schedOk && actualOk && isShiftDay && !isHoliday && !isLeave) {
                    // late: actual start after scheduled start
                    late = pos(actualStart.diff(schedStart, "minutes"));

                    // undertime: actual end before scheduled end
                    undertime = pos(schedEnd.diff(actualEnd, "minutes"));

                    // overtime: only count approved OT minutes that overlap actual work window
                    // Uses your helper (day-level OT schedules)
                    const approvedOTs = await getApprovedOvertimesForDay({
                        employeeId: attendance.employee_id,
                        workDay: formatted,
                        transaction: null,
                    });

                    overtime = 0;
                    for (const otApp of approvedOTs || []) {
                        const ot = otApp.overtime;
                        if (!ot) continue;

                        const otStart = combineDayTime(formatted, ot.time_start || ot.timeStart);
                        const otEnd = combineDayTime(formatted, ot.time_end || ot.timeEnd);

                        if (otStart.isValid() && otEnd.isValid() && otEnd.isAfter(otStart)) {
                            overtime += overlapMinutes(actualStart, actualEnd, otStart, otEnd);
                        }
                    }
                }
            }

            results.push({
                date: formatted,

                // IDs
                attendance_id: dtr?.id || null,
                adjustment_id: adjustment?.id || null,

                // display times (adjusted wins)
                time_in: finalTimeIn,
                time_out: finalTimeOut,

                // optional audit fields
                original_time_in: originalTimeIn,
                original_time_out: originalTimeOut,
                adjusted_time_in: adjustedTimeIn,
                adjusted_time_out: adjustedTimeOut,

                // ✅ computed using (adjustment OR attendance) + (effective shift + shiftday) + (approved OT overlap)
                late,
                undertime,
                overtime,

                notes,
            });

            day.add(1, "day");
        }

        // Approvals (unchanged)
        const approvals = await db.Approval.findAll({
            where: { 
                document_id: id, 
                is_active: true 
            },
            include: [
                {
                    model: db.ApprovalSetting,
                    as: "setting",
                    where: { 
                        type: "TimeCard" 
                    },
                    include: [
                        {
                            model: db.User,
                            as: "approver",
                            attributes: ["id"],
                            include: [
                                {
                                    model: db.EmployeeAccount,
                                    as: "employeeAccount",
                                    include: [
                                        {
                                            model: db.Employee,
                                            as: "employee",
                                            include: [
                                                {
                                                    model: db.Employment,
                                                    as: "employment",
                                                    include: [
                                                        { 
                                                            model: db.Position, 
                                                            as: "position" 
                                                        }
                                                    ],
                                                },
                                                {
                                                    model: db.EmployeeSignature,
                                                    as: 'signature'
                                                }
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: db.User,
                            as: "owner",
                            attributes: ["id"],
                            include: [
                                {
                                    model: db.EmployeeAccount,
                                    as: "employeeAccount",
                                    include: [
                                        {
                                            model: db.Employee,
                                            as: "employee",
                                            include: [
                                                {
                                                    model: db.Employment,
                                                    as: "employment",
                                                    include: [
                                                        { 
                                                            model: db.Position, 
                                                            as: "position" 
                                                        }
                                                    ],
                                                },
                                                {
                                                    model: db.EmployeeSignature,
                                                    as: 'signature'
                                                }
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            order: [[{ model: db.ApprovalSetting, as: "setting" }, "order", "ASC"]],
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
        // 8️⃣ Generate PDF
        const monthName = moment(startDate).format("MMMM");
        const templatePath = path.join(__dirname, '../templates/reports/DTR.pug');
        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const html = pug.renderFile(templatePath, {
            seal,
            month: monthName,
            logs: results,
            signatories: mappedApprovals,
            moment
        });

        const browser = await puppeteer.launch({
        //   executablePath: '/usr/bin/google-chrome',
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
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
            landscape: false,
            margin: { top: '25px', bottom: '25px', left: '25px', right: '25px' },
            preferCSSPageSize: true,
            printBackground: true
        });

        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
};

const pos = (n) => (n > 0 ? n : 0);

const combineDayTime = (workDay, timeStr) => {
  const t = (timeStr || "").trim();
  if (!t) return moment.invalid();
  const m = moment(`${workDay} ${t}`, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"], true);
  if (!m.isValid() && t.length === 5) {
    return moment(`${workDay} ${t}:00`, "YYYY-MM-DD HH:mm:ss", true);
  }
  return m;
};

const pickEffectiveEmployeeShift = (employeeShifts, workDayYMD) => {
  const day = moment(workDayYMD, "YYYY-MM-DD", true);
  const valid = (employeeShifts || [])
    .filter((es) => es.is_active)
    .filter((es) => {
      const from = moment(es.effective_from, "YYYY-MM-DD", true);
      const to = es.effective_to ? moment(es.effective_to, "YYYY-MM-DD", true) : null;
      return from.isSameOrBefore(day, "day") && (!to || to.isSameOrAfter(day, "day"));
    })
    .sort((a, b) => moment(b.effective_from).diff(moment(a.effective_from)));
  return valid[0] || null;
};

const overlapMinutes = (aStart, aEnd, bStart, bEnd) => {
  const start = moment.max(aStart, bStart);
  const end = moment.min(aEnd, bEnd);
  const diff = end.diff(start, "minutes");
  return diff > 0 ? diff : 0;
};

const getApprovedOvertimesForDay = async ({ employeeId, workDay, transaction }) => {
  return db.EmployeeOvertimeApplication.findAll({
    where: {
      employee_id: employeeId,
      status: "Approved",
    },
    include: [
      {
        model: db.Overtime,
        as: "overtime",
        required: true,
        where: {
          date: workDay,
          status: "Approved",
          is_active: true,
        },
      },
    ],
    transaction,
  });
};