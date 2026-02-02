const { Op, fn, col, literal  } = require("sequelize");

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');

const pug = require('pug');
const puppeteer = require('puppeteer');

const db = require('../models');
const { sequelize } = db;

exports.GetAll = async (req, res) => {
    const Page = parseInt(req.query.Page, 10) || 1
    const Limit = parseInt(req.query.Limit, 10) || 10
    const Filter = (req.query.Filter || '').trim()
    const Offset = (Page - 1) * Limit
    const month = parseInt(req.query.month, 10)
    const year = parseInt(req.query.year, 10)

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

        const { count, rows } = await db.Attendance.findAndCountAll({
            include: [
                {
                    model: db.Employee,
                    as: 'employee',
                    required: true,
                    where: Filter
                        ? {
                            [Op.or]: [
                                { first_name: { [Op.like]: `%${Filter}%` } },
                                { middle_name: { [Op.like]: `%${Filter}%` } },
                                { last_name: { [Op.like]: `%${Filter}%` } },
                            ],
                        }
                        : undefined,
                },
            ],
            where: {
                [Op.and]: [
                    { date_from: { [Op.lte]: endDate } },
                    { date_to: { [Op.gte]: startDate } },
                ],
            },
            distinct: true,
            limit: Limit,
            offset: Offset
        })

        return res.json({
            data: rows,
            meta: {
                TotalItems: count,
                TotalPages: Math.ceil(count / Limit),
                CurrentPage: Page,
            },
        })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}


// exports.Create = async (req, res) => {

//     const { 
//         dateStart,
//         dateEnd
//     } = req.body;

//     try {

//         const existingAttendance = await EmployeeAttendance.findOne({
//             where: {
//                 date_start: dateStart,
//                 date_end: dateEnd
//             }
//         });

//         if (existingAttendance) {
//             return res.status(400).json({
//                 message: 'Attendance for this period already exists.'
//             });
//         }

//         // Fetch approval settings by document type
//         const signatories = await db.ApprovalSetting.findAll({
//             where: {
//                 owner_id: account.user_id,
//                 type: 'TimeCard',
//                 is_active: true
//             },
//             order: [['order', 'ASC']]
//         });

//         for (const sig of signatories) {

//             const isFirstApprover = sig.order === 1;

//             await db.Approval.create({
//                 setting_id: sig.id,
//                 document_id: leave.id,
//                 status: isFirstApprover ? 'Approved' : 'Pending',
//                 signed_at: isFirstApprover ? new Date() : null,
//                 remarks: isFirstApprover ? 'Auto-approved (owner is first approver)' : null,
//                 is_active: true
//             });
//         }

//         res.status(201).json({
//             message: "Record Saved!"
//         });

//     } catch (error) {

//         res.status(400).json({ 
//             error: error.message 
//         });

//     }
// };
const pos = (n) => (n > 0 ? n : 0);

const combineDayTime = (workDay, timeStr) => {
  const hhmmss = (timeStr || "00:00:00").slice(0, 8);
  return moment(`${workDay} ${hhmmss}`, "YYYY-MM-DD HH:mm:ss", true);
};

function pickEffectiveEmployeeShift(employeeShifts, workDayYMD) {
  const day = moment(workDayYMD, "YYYY-MM-DD", true);

  const valid = (employeeShifts || [])
    .filter(es => es.is_active)
    .filter(es => {
      const from = moment(es.effective_from, "YYYY-MM-DD", true);
      const to = es.effective_to ? moment(es.effective_to, "YYYY-MM-DD", true) : null;
      return from.isSameOrBefore(day, "day") && (!to || to.isSameOrAfter(day, "day"));
    })
    .sort((a, b) => moment(b.effective_from).diff(moment(a.effective_from)));

  return valid[0] || null;
}

function overlapMinutes(aStart, aEnd, bStart, bEnd) {
  const start = moment.max(aStart, bStart);
  const end = moment.min(aEnd, bEnd);
  const diff = end.diff(start, "minutes");
  return diff > 0 ? diff : 0;
}

// Approved overtime schedules for employee on workDay
async function getApprovedOvertimesForDay({ employeeId, workDay, transaction }) {
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
}

exports.Create = async (req, res) => {
  const { dateStart, dateEnd } = req.body;

  if (!dateStart || !dateEnd) {
    return res.status(400).json({ message: "dateStart and dateEnd are required." });
  }

  const start = moment(dateStart, "YYYY-MM-DD", true);
  const end = moment(dateEnd, "YYYY-MM-DD", true);

  if (!start.isValid() || !end.isValid()) {
    return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
  }
  if (end.isBefore(start)) {
    return res.status(400).json({ message: "dateEnd must be >= dateStart." });
  }

  const tx = await sequelize.transaction();

  try {
    // ✅ Load employees + shifts (required for schedule validation)
    const employees = await db.Employee.findAll({
      where: { status: "Active" },
      include: [
        {
          model: db.EmployeeShift,
          as: "employeeShifts",
          required: true,
          where: { is_active: true },
          include: [
            {
              model: db.Shift,
              as: "shift",
              include: [{ model: db.ShiftDay, as: "days" }],
            },
          ],
        },
      ],
      transaction: tx,
    });

    if (!employees.length) {
      await tx.rollback();
      return res.status(400).json({ message: "No active employees with shifts found." });
    }

    let attendanceHeadersCreated = 0;
    let attendanceDaysCreated = 0;

    for (const emp of employees) {
      // ✅ Prevent duplicate header per employee + date range
      const existingHeader = await db.Attendance.findOne({
        where: {
          employee_id: emp.id,
          date_from: dateStart,
          date_to: dateEnd,
        },
        transaction: tx,
      });

      if (existingHeader) {
        // Skip this employee (already has header for this period)
        continue;
      }

      // ✅ Create Attendance HEADER for this employee
      const header = await db.Attendance.create(
        {
          employee_id: emp.id,
          date_from: dateStart, // from req.body
          date_to: dateEnd,     // from req.body
          status: "Pending",
        },
        { transaction: tx }
      );

      attendanceHeadersCreated += 1;

      // ✅ Get per-day IN/OUT from logs in one query (group by date)
      const dayRows = await db.EmployeeLog.findAll({
        where: {
          employee_id: emp.id,
          captured_at: { [Op.between]: [`${dateStart} 00:00:00`, `${dateEnd} 23:59:59`] },
          // optional filters:
          // liveness_passed: true,
          // recognition_score: { [Op.gte]: 0.90 },
        },
        attributes: [
          [fn("DATE", col("captured_at")), "work_day"],
          [fn("TIME", fn("MIN", col("captured_at"))), "time_in"],
          [fn("TIME", fn("MAX", col("captured_at"))), "time_out"],
        ],
        group: [fn("DATE", col("captured_at"))],
        order: [[literal("work_day"), "ASC"]],
        raw: true,
        transaction: tx,
      });

      // If no logs, keep header but no day rows
      if (!dayRows.length) continue;

      // ✅ Create EmployeeAttendance days linked to the header
      const rowsToInsert = [];

      for (const row of dayRows) {
        const workDay = row.work_day;   // YYYY-MM-DD
        const time_in = row.time_in;    // HH:mm:ss
        const time_out = row.time_out;  // HH:mm:ss

        // Validate effective shift for that day
        const effectiveES = pickEffectiveEmployeeShift(emp.employeeShifts, workDay);
        if (!effectiveES?.shift) continue;

        const shift = effectiveES.shift;

        // ShiftDays numeric 1..7
        const allowedDays = new Set((shift.days || []).map(d => Number(d.day_of_week)));
        const dow = moment(workDay, "YYYY-MM-DD", true).isoWeekday(); // 1..7
        if (!allowedDays.has(dow)) continue;

        // build moments for calculations
        const actualIn = combineDayTime(workDay, time_in);
        const actualOut = combineDayTime(workDay, time_out);

        // shift moments
        const shiftStart = combineDayTime(workDay, shift.start_time);
        let shiftEnd = combineDayTime(workDay, shift.end_time);
        if (shift.crosses_midnight) shiftEnd = shiftEnd.add(1, "day");

        const grace = Number(shift.grace_minutes) || 0;

        const late_minutes = pos(
          actualIn.diff(shiftStart.clone().add(grace, "minutes"), "minutes")
        );

        const undertime_minutes = pos(shiftEnd.diff(actualOut, "minutes"));

        // ✅ Overtime based on approved OT schedules
        const otApps = await getApprovedOvertimesForDay({
          employeeId: emp.id,
          workDay,
          transaction: tx,
        });

        let overtime_minutes = 0;

        for (const app of otApps) {
          const ot = app.overtime;
          if (!ot) continue;

          let otStart = combineDayTime(workDay, ot.time_start);
          let otEnd = combineDayTime(workDay, ot.time_end);

          // OT crosses midnight
          if (otEnd.isBefore(otStart)) otEnd = otEnd.add(1, "day");

          // overlap between actual worked and approved OT window
          overtime_minutes += overlapMinutes(actualIn, actualOut, otStart, otEnd);
        }

        rowsToInsert.push({
          attendance_id: header.id,
          work_day: workDay,
          time_in,
          time_out,
          late_minutes,
          undertime_minutes,
          overtime_minutes,
          is_locked: false,
          locked_at: null,
        });
      }

      if (rowsToInsert.length) {
        await db.EmployeeAttendance.bulkCreate(rowsToInsert, { transaction: tx });
        attendanceDaysCreated += rowsToInsert.length;
      }
    }

    if (attendanceHeadersCreated === 0 && attendanceDaysCreated === 0) {
      throw new Error("Nothing created. Either headers already exist or no employees/logs matched.");
    }

    await tx.commit();

    return res.status(201).json({
      message: "Attendance headers and daily attendance rows created successfully.",
      attendance_headers_created: attendanceHeadersCreated,
      attendance_days_created: attendanceDaysCreated,
    });
  } catch (error) {
    await tx.rollback();
    console.error("Attendance Create ERROR:", error);
    return res.status(400).json({ error: error.message });
  }
};

exports.UpdateDTR = async (req, res) => {

    const {
        id
    } = req.params;

    const { 
        employeeid,
        attendances
    } = req.body;

    const { date, times } = attendances;

    try {

        if (!attendances || !date || !Array.isArray(times)) {
            return res.status(400).json({ message: 'Invalid payload structure.' });
        }

        const recordsToInsert = [];

        for (const t of times) {
            if (!t || t.trim() === '') continue;

            // Format time to DB TIME
            const formattedTime = moment(t, ['h:mm A', 'hh:mm A']).format('HH:mm:ss');

            // Check if record already exists
            const exists = await DailyTimeRecord.findOne({
                where: {
                    employee_id: employeeid,
                    date,
                    time: formattedTime
                }
            });

            if (!exists) {
                recordsToInsert.push({
                    employee_id: employeeid,
                    attendance_id: id,
                    date,
                    time: formattedTime
                });
            }
        }

        if (!recordsToInsert.length) {
            return res.status(400).json({
                message: 'No new time entries to save (all duplicates).'
            });
        }

        // Bulk insert only new records
        await DailyTimeRecord.bulkCreate(recordsToInsert);

        res.status(201).json({
            message: "Record Saved!"
        });

    } catch (error) {

        res.status(400).json({ 
            error: error.message 
        });

    }
};

exports.GetAttendance = async (req, res) => {

    const id = parseInt(req.params.id);

    try {
        // 1️⃣ Fetch the attendance record with daily logs
        const attendance = await EmployeeAttendance.findOne({
            where: { id },
            include: [
                { model: DailyTimeRecord, as: 'logs' }
            ]
        });

        if (!attendance) return res.status(404).json({ error: 'Attendance not found' });

        const startDate = moment(attendance.date_start).format('YYYY-MM-DD');
        const endDate = moment(attendance.date_end).format('YYYY-MM-DD');

        // 2️⃣ Approved leave applications
        const leaves = await EmployeeLeaveApplication.findAll({
            where: {
                employee_id: attendance.employee_id,
                status: 'Approved',
                date_from: { [Op.lte]: endDate },
                date_to: { [Op.gte]: startDate }
            },
            include: [{ model: LeaveType, as: 'leaveType' }]
        });

        // 3️⃣ Holidays
        const holidays = await Holiday.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] },
                isActive: true
            }
        });

        // 4️⃣ Approved overtime
        const overtimes = await EmployeeOvertimeApplication.findAll({
            where: { employee_id: attendance.employee_id, status: 'Approved' },
            include: [
                {
                    model: Overtime,
                    as: 'overtime',
                    where: {
                        date: { [Op.between]: [startDate, endDate] },
                        status: 'Approved'
                    }
                }
            ]
        });

        // 5️⃣ Build lookup maps
        const leaveMap = {};
        leaves.forEach(leave => {
            let day = moment(leave.date_from);
            const end = moment(leave.date_to);
            while (day.isSameOrBefore(end)) {
                leaveMap[day.format('YYYY-MM-DD')] = leave.leaveType.name;
                day.add(1, 'day');
            }
        });

        const holidayMap = {};
        holidays.forEach(h => {
            holidayMap[moment(h.date).format('YYYY-MM-DD')] = h.name;
        });

        const overtimeMap = {};
        overtimes.forEach(otApp => {
            const ot = otApp.overtime;
            if (!overtimeMap[ot.date]) overtimeMap[ot.date] = [];
            overtimeMap[ot.date].push({
                start: moment(ot.timeStart, 'HH:mm:ss').format('h:mm A'),
                end: moment(ot.timeEnd, 'HH:mm:ss').format('h:mm A'),
                description: ot.description,
                status: ot.status
            });
        });

        // 6️⃣ Generate DTR for attendance period
        const result = [];
        let day = moment(startDate);
        const endDay = moment(endDate);

        while (day.isSameOrBefore(endDay)) {
            const formatted = day.format('YYYY-MM-DD');

            // const times = attendance.logs
            //     .filter(l => moment(l.date).format('YYYY-MM-DD') === formatted)
            //     .map(l => l.time ? moment(l.time, ['HH:mm', 'HH:mm:ss']).format('h:mm A') : '');
            // Use raw time from logs (no formatting)
            const times = attendance.logs
                .filter(l => moment(l.date).format('YYYY-MM-DD') === formatted)
                .map(l => l.time 
                    ? moment(l.time, ['HH:mm', 'HH:mm:ss']).format('HH:mm') 
                    : ''
                );

            const paddedTimes = times.length < 4 ? [...times, ...Array(4 - times.length).fill('')] :
                                times.length > 4 ? times.slice(0, 4) : times;

            result.push({
                date: formatted,
                times: paddedTimes,
                leaveType: leaveMap[formatted] || '',
                holiday: holidayMap[formatted] || '',
                overtimes: overtimeMap[formatted]?.length > 0 ? 'Overtime' : ''
            });

            day.add(1, 'day');
        }

        // 7️⃣ Fetch approvals
        const approvals = await Approval.findAll({
            where: { document_id: attendance.id, is_active: true },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'TimeCard'
                    },
                    include: [
                        {
                            model: User,
                            as: 'approver',
                            attributes: ['id'],
                            include: [
                                {
                                    model: EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: Employment,
                                                    as: 'employment',
                                                    include: [{ model: Position, as: 'position' }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: User,
                            as: 'owner',
                            attributes: ['id'],
                            include: [
                                {
                                    model: EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: Employment,
                                                    as: 'employment',
                                                    include: [{ model: Position, as: 'position' }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [[{ model: ApprovalSetting, as: 'setting' }, 'order', 'ASC']]
        });

        // 8️⃣ Return attendance ID, results, and approvals
        res.json({
            id: attendance.id,
            results: result,
            approvals
        });

    } catch (error) {

        res.status(500).json({ 
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

        const attendance = await EmployeeAttendance.findByPk(id);
        
        if (!attendance) {
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

        const approval = await Approval.findByPk(approvalid);
        await approval.update({
            status: 'Approved'
        })
        const approvals = await Approval.count({
            where: {
                document_id: id,
                status: { [Op.ne]: "Approved" }
            }
        });
        if (approvals === 0) {
            await attendance.update({ 
                status: 'Approved'
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

exports.GenerateAttendancePDF = async (req, res) => {
    const { id } = req.params;
    let browser;

    try {
        // 1️⃣ Fetch the attendance record with daily logs
        const attendance = await EmployeeAttendance.findOne({
            where: { id },
            include: [
                { model: DailyTimeRecord, as: 'logs' }
            ]
        });

        if (!attendance) return res.status(404).json({ error: 'Attendance not found' });

        const startDate = moment(attendance.date_start).format('YYYY-MM-DD');
        const endDate = moment(attendance.date_end).format('YYYY-MM-DD');

        // 2️⃣ Fetch approved leave applications
        const leaves = await EmployeeLeaveApplication.findAll({
            where: {
                employee_id: attendance.employee_id,
                status: 'Approved',
                date_from: { [Op.lte]: endDate },
                date_to: { [Op.gte]: startDate }
            },
            include: [{ model: LeaveType, as: 'leaveType' }]
        });

        // 3️⃣ Fetch holidays
        const holidays = await Holiday.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] },
                isActive: true
            }
        });

        // 4️⃣ Fetch approved overtime
        const overtimes = await EmployeeOvertimeApplication.findAll({
            where: { employee_id: attendance.employee_id, status: 'Approved' },
            include: [
                {
                    model: Overtime,
                    as: 'overtime',
                    where: {
                        date: { [Op.between]: [startDate, endDate] },
                        status: 'Approved'
                    }
                }
            ]
        });

        // 5️⃣ Build lookup maps
        const leaveMap = {};
        leaves.forEach(leave => {
            let day = moment(leave.date_from);
            const end = moment(leave.date_to);
            while (day.isSameOrBefore(end)) {
                leaveMap[day.format('YYYY-MM-DD')] = leave.leaveType.name;
                day.add(1, 'day');
            }
        });

        const holidayMap = {};
        holidays.forEach(h => {
            holidayMap[moment(h.date).format('YYYY-MM-DD')] = h.name;
        });

        const overtimeMap = {};
        overtimes.forEach(otApp => {
            const ot = otApp.overtime;
            if (!overtimeMap[ot.date]) overtimeMap[ot.date] = [];
            overtimeMap[ot.date].push({
                start: moment(ot.timeStart, 'HH:mm:ss').format('h:mm A'),
                end: moment(ot.timeEnd, 'HH:mm:ss').format('h:mm A'),
                description: ot.description,
                status: ot.status
            });
        });

        // 6️⃣ Generate Daily Records
        const result = [];
        let day = moment(startDate);
        const endDay = moment(endDate);

        while (day.isSameOrBefore(endDay)) {
            const formatted = day.format('YYYY-MM-DD');

            // Time logs
            const times = attendance.logs
                .filter(l => moment(l.date).format('YYYY-MM-DD') === formatted)
                .map(l => l.time ? moment(l.time, ['HH:mm', 'HH:mm:ss']).format('h:mm A') : '');

            const paddedTimes = times.length < 4 ? [...times, ...Array(4 - times.length).fill('')] :
                                times.length > 4 ? times.slice(0, 4) : times;

            result.push({
                date: formatted,
                times: paddedTimes,
                leaveType: leaveMap[formatted] || '',
                holiday: holidayMap[formatted] || '',
                overtimes: overtimeMap[formatted]?.length > 0 ? 'Overtime' : ''
            });

            day.add(1, 'day');
        }

        // 7️⃣ Fetch approvals
        const approvals = await Approval.findAll({
            where: { document_id: attendance.id, is_active: true },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'TimeCard'
                    },
                    include: [
                        {
                            model: User,
                            as: 'approver',
                            attributes: ['id'],
                            include: [
                                {
                                    model: EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: Employment,
                                                    as: 'employment',
                                                    include: [{ model: Position, as: 'position' }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: User,
                            as: 'owner',
                            attributes: ['id'],
                            include: [
                                {
                                    model: EmployeeAccount,
                                    as: 'employeeAccount',
                                    include: [
                                        {
                                            model: Employee,
                                            as: 'employee',
                                            include: [
                                                {
                                                    model: Employment,
                                                    as: 'employment',
                                                    include: [{ model: Position, as: 'position' }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [[{ model: ApprovalSetting, as: 'setting' }, 'order', 'ASC']]
        });

        // Map approvals to the desired format
        const signatories = approvals.map((app) => {
            const employee = app?.setting?.approver?.employeeAccount?.employee;
            const profile = employee || {};

            const position = app?.setting?.approver?.employeeAccount?.employment?.position?.name || '';
            // Format full name (First M. Last Suffix)
            const first = profile?.first_name || '';
            const middle = profile?.middle_name ? `${profile.middle_name.charAt(0)}.` : '';
            const last = profile?.last_name || '';
            const suffix = profile?.suffix ? ` ${profile.suffix}` : '';
            const userName = `${first} ${middle} ${last}${suffix}`.replace(/\s+/g, ' ').trim();

            // Only show signature & date if approval is approved
            const isApproved = app?.status === 'Approved';
            const signaturePath = app?.setting?.signature; // Assuming approval setting stores the signature path

            return {
                description: app?.setting.description || '',
                approver: userName,
                position,
                signature: isApproved && signaturePath
                    ? 'data:image/png;base64,' +
                    fs.readFileSync(path.join(__dirname, `../public/${signaturePath}`)).toString('base64')
                    : null,
                date: isApproved ? moment(app?.signed_at || app?.createdAt).format('MMMM DD, YYYY hh:mm A') : null,
                isSigned: isApproved
            };
        });

        // 8️⃣ Generate PDF
        const monthName = moment(startDate).format("MMMM");
        const templatePath = path.join(__dirname, '../templates/reports/DTR.pug');
        const seal = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, '../templates/reports/logo.jpg')).toString('base64');

        const html = pug.renderFile(templatePath, {
            seal,
            month: monthName,
            logs: result,
            signatories,
            moment
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
