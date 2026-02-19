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

//     if (!dateStart || !dateEnd) {
//         return res.status(400).json({ message: "dateStart and dateEnd are required." });
//     }

//     const start = moment(dateStart, "YYYY-MM-DD", true);
//     const end = moment(dateEnd, "YYYY-MM-DD", true);

//     if (!start.isValid() || !end.isValid()) {
//         return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
//     }
//     if (end.isBefore(start)) {
//         return res.status(400).json({ message: "dateEnd must be >= dateStart." });
//     }

//     const tx = await sequelize.transaction();

//     try {
        
//         const employees = await db.Employee.findAll({
//             where: { 
//                 status: "Active" 
//             },
//             include: [
//                 {
//                     model: db.EmployeeShift,
//                     as: "employeeShifts",
//                     required: true,
//                     where: { 
//                         is_active: true 
//                     },
//                     include: [
//                         {
//                             model: db.Shift,
//                             as: "shift",
//                             include: [
//                                 { 
//                                     model: db.ShiftDay, 
//                                     as: "days" 
//                                 }
//                             ],
//                         },
//                     ],
//                 },
//             ],
//             transaction: tx,
//         });

//         if (!employees.length) {
//             await tx.rollback();
//             return res.status(400).json({ message: "No active employees with shifts found." });
//         }

//         let attendanceHeadersCreated = 0;
//         let attendanceDaysCreated = 0;

//         for (const emp of employees) {
//             // ✅ Prevent duplicate header per employee + date range
//             const existingHeader = await db.Attendance.findOne({
//                 where: {
//                     employee_id: emp.id,
//                     date_from: dateStart,
//                     date_to: dateEnd,
//                 },
//                 transaction: tx,
//             });

//             if (existingHeader) {
//                 // Skip this employee (already has header for this period)
//                 continue;
//             }

//             // ✅ Create Attendance HEADER for this employee
//             const header = await db.Attendance.create(
//                 {
//                     employee_id: emp.id,
//                     date_from: dateStart, // from req.body
//                     date_to: dateEnd,     // from req.body
//                     status: "Pending",
//                 },
//                 { transaction: tx }
//             );

//             attendanceHeadersCreated += 1;

//             // ✅ Get per-day IN/OUT from logs in one query (group by date)
//             const dayRows = await db.EmployeeLog.findAll({
//                 where: {
//                     employee_id: emp.id,
//                     captured_at: { [Op.between]: [`${dateStart} 00:00:00`, `${dateEnd} 23:59:59`] },
//                     // optional filters:
//                     // liveness_passed: true,
//                     // recognition_score: { [Op.gte]: 0.90 },
//                 },
//                 attributes: [
//                     [fn("DATE", col("captured_at")), "work_day"],
//                     [fn("TIME", fn("MIN", col("captured_at"))), "time_in"],
//                     [fn("TIME", fn("MAX", col("captured_at"))), "time_out"],
//                 ],
//                 group: [fn("DATE", col("captured_at"))],
//                 order: [[literal("work_day"), "ASC"]],
//                 raw: true,
//                 transaction: tx,
//             });

//             // If no logs, keep header but no day rows
//             if (!dayRows.length) continue;

//             // ✅ Create EmployeeAttendance days linked to the header
//             const rowsToInsert = [];

//             for (const row of dayRows) {
//                 const workDay = row.work_day;   // YYYY-MM-DD
//                 const time_in = row.time_in;    // HH:mm:ss
//                 const time_out = row.time_out;  // HH:mm:ss

//                 // Validate effective shift for that day
//                 const effectiveES = pickEffectiveEmployeeShift(emp.employeeShifts, workDay);
//                 if (!effectiveES?.shift) continue;

//                 const shift = effectiveES.shift;

//                 // ShiftDays numeric 1..7
//                 const allowedDays = new Set((shift.days || []).map(d => Number(d.day_of_week)));
//                 const dow = moment(workDay, "YYYY-MM-DD", true).isoWeekday(); // 1..7
//                 if (!allowedDays.has(dow)) continue;

//                 // build moments for calculations
//                 const actualIn = combineDayTime(workDay, time_in);
//                 const actualOut = combineDayTime(workDay, time_out);

//                 // shift moments
//                 const shiftStart = combineDayTime(workDay, shift.start_time);
//                 let shiftEnd = combineDayTime(workDay, shift.end_time);
//                 if (shift.crosses_midnight) shiftEnd = shiftEnd.add(1, "day");

//                 const grace = Number(shift.grace_minutes) || 0;

//                 const late_minutes = pos(
//                     actualIn.diff(shiftStart.clone().add(grace, "minutes"), "minutes")
//                 );

//                 const undertime_minutes = pos(shiftEnd.diff(actualOut, "minutes"));

//                 // ✅ Overtime based on approved OT schedules
//                 const otApps = await getApprovedOvertimesForDay({
//                     employeeId: emp.id,
//                     workDay,
//                     transaction: tx,
//                 });

//                 let overtime_minutes = 0;

//                 for (const app of otApps) {
//                     const ot = app.overtime;
//                     if (!ot) continue;

//                     let otStart = combineDayTime(workDay, ot.time_start);
//                     let otEnd = combineDayTime(workDay, ot.time_end);

//                     // OT crosses midnight
//                     if (otEnd.isBefore(otStart)) otEnd = otEnd.add(1, "day");

//                     // overlap between actual worked and approved OT window
//                     overtime_minutes += overlapMinutes(actualIn, actualOut, otStart, otEnd);
//                 }

//                 rowsToInsert.push({
//                     attendance_id: header.id,
//                     work_day: workDay,
//                     time_in,
//                     time_out,
//                     late_minutes,
//                     undertime_minutes,
//                     overtime_minutes,
//                     is_locked: false,
//                     locked_at: null,
//                 });
//             }

//             if (rowsToInsert.length) {
//                 await db.EmployeeAttendance.bulkCreate(rowsToInsert, { transaction: tx });
//                 attendanceDaysCreated += rowsToInsert.length;
//             }

//             /**
//              * Save Signatories
//              */
//             // // Fetch approval settings by document type
//             // const account = await db.EmployeeAccount.findOne({
//             //     employee_id: emp.id,
//             //     include: [
//             //         {
//             //             model: db.User,
//             //             as: 'user'
//             //         }
//             //     ]
//             // });
//             // const signatories = await db.ApprovalSetting.findAll({
//             //     where: {
//             //         owner_id: account.user_id,
//             //         type: 'TimeCard',
//             //         is_active: true
//             //     },
//             //     order: [['order', 'ASC']]
//             // });
    
//             // for (const sig of signatories) {
//             //     // const isFirstApprover = (sig.order === 1 && !account.is_management);
//             //     await db.Approval.create({
//             //         setting_id: sig.id,
//             //         document_id: header.id,
//             //         status: 'Pending',
//             //         signed_at: null,
//             //         remarks: null,
//             //         is_active: true
//             //     });
//             // }
//             // Fetch approval settings by document type
//             const employeeAccount = await db.EmployeeAccount.findOne({
//                 employee_id: emp.id,
//                 include: [
//                     {
//                         model: db.User,
//                         as: 'user',
//                         where: {
//                             role: 'Employee'
//                         }
//                     }
//                 ]
//             });
//             const employeeSignatories = await db.ApprovalSetting.findAll({
//                 where: {
//                     owner_id: employeeAccount.user_id,
//                     type: 'TimeCard',
//                     order: 1,
//                     is_active: true
//                 },
//                 order: [['order', 'ASC']]
//             });
    
//             for (const sig of employeeSignatories) {
//                 // const isFirstApprover = (sig.order === 1 && !account.is_management);
//                 await db.Approval.create({
//                     setting_id: sig.id,
//                     document_id: header.id,
//                     status: 'Pending',
//                     signed_at: null,
//                     remarks: null,
//                     is_active: true
//                 });
//             }
//             // management
//             const managementAccount = await db.EmployeeAccount.findOne({
//                 employee_id: emp.id,
//                 include: [
//                     {
//                         model: db.User,
//                         as: 'user',
//                         where: {
//                             role: 'Management'
//                         }
//                     }
//                 ]
//             });
//             const managementSignatories = await db.ApprovalSetting.findAll({
//                 where: {
//                     owner_id: managementAccount.user_id,
//                     type: 'TimeCard',
//                     order: {
//                         [Op.gte]: 2
//                     },
//                     is_active: true
//                 },
//                 order: [['order', 'ASC']]
//             });
    
//             for (const sig of managementSignatories) {
//                 // const isFirstApprover = (sig.order === 1 && !account.is_management);
//                 await db.Approval.create({
//                     setting_id: sig.id,
//                     document_id: header.id,
//                     status: 'Pending',
//                     signed_at: null,
//                     remarks: null,
//                     is_active: true
//                 });
//             }
//         }

//         if (attendanceHeadersCreated === 0 && attendanceDaysCreated === 0) {
//             throw new Error("Nothing created. Either headers already exist or no employees/logs matched.");
//         }

//         await tx.commit();

//         return res.status(201).json({
//             message: "Attendance headers and daily attendance rows created successfully.",
//             attendance_headers_created: attendanceHeadersCreated,
//             attendance_days_created: attendanceDaysCreated,
//         });
//     } catch (error) {
//         await tx.rollback();
//         console.error("Attendance Create ERROR:", error);
//         return res.status(400).json({ error: error.message });
//     }
// };

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
    // ✅ Get all active employees with shifts
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
      // ✅ Prevent duplicate Attendance header
      const existingHeader = await db.Attendance.findOne({
        where: {
          employee_id: emp.id,
          date_from: dateStart,
          date_to: dateEnd,
        },
        transaction: tx,
      });

      if (existingHeader) continue;

      // ✅ Create Attendance header ALWAYS
      const header = await db.Attendance.create(
        {
          employee_id: emp.id,
          date_from: dateStart,
          date_to: dateEnd,
          status: "Pending",
        },
        { transaction: tx }
      );

      attendanceHeadersCreated++;

      /**
       * =====================================================
       * GET EMPLOYEE LOGS (RAW) then EXTRACT TIME in Node.js
       * =====================================================
       */
      const logs = await db.EmployeeLog.findAll({
        where: {
          employee_id: emp.id,
          captured_at: {
            [Op.between]: [`${dateStart} 00:00:00`, `${dateEnd} 23:59:59`],
          },
        },
        attributes: ["captured_at"],
        order: [["captured_at", "ASC"]],
        raw: true,
        transaction: tx,
      });

      // ✅ Group logs per day: time_in = first, time_out = last (exact as stored)
      const grouped = {};

      for (const log of logs) {
        const m = moment(log.captured_at); // ✅ no timezone conversion
        const work_day = m.format("YYYY-MM-DD");
        const time = m.format("HH:mm:ss");

        if (!grouped[work_day]) {
          grouped[work_day] = { time_in: time, time_out: time };
        } else {
          grouped[work_day].time_out = time;
        }
      }

      /**
       * =====================================================
       * CREATE EmployeeAttendance ONLY IF LOGS EXIST
       * =====================================================
       */
      const rowsToInsert = [];

      for (const work_day of Object.keys(grouped)) {
        const { time_in, time_out } = grouped[work_day];

        // Validate effective shift for that day
        const effectiveES = pickEffectiveEmployeeShift(emp.employeeShifts, work_day);
        if (!effectiveES?.shift) continue;

        const shift = effectiveES.shift;

        // ShiftDays numeric 1..7
        const allowedDays = new Set((shift.days || []).map((d) => Number(d.day_of_week)));
        const dow = moment(work_day, "YYYY-MM-DD", true).isoWeekday(); // 1..7
        if (allowedDays.size && !allowedDays.has(dow)) continue;

        // build moments for calculations
        const actualIn = combineDayTime(work_day, time_in);
        const actualOut = combineDayTime(work_day, time_out);

        // shift moments
        const shiftStart = combineDayTime(work_day, shift.start_time);
        let shiftEnd = combineDayTime(work_day, shift.end_time);
        if (shift.crosses_midnight) shiftEnd = shiftEnd.add(1, "day");

        const grace = Number(shift.grace_minutes) || 0;

        const late_minutes = pos(actualIn.diff(shiftStart.clone().add(grace, "minutes"), "minutes"));
        const undertime_minutes = pos(shiftEnd.diff(actualOut, "minutes"));

        // ✅ Overtime based on approved OT schedules
        const otApps = await getApprovedOvertimesForDay({
          employeeId: emp.id,
          workDay: work_day,
          transaction: tx,
        });

        let overtime_minutes = 0;

        for (const app of otApps) {
          const ot = app.overtime;
          if (!ot) continue;

          let otStart = combineDayTime(work_day, ot.time_start);
          let otEnd = combineDayTime(work_day, ot.time_end);

          // OT crosses midnight
          if (otEnd.isBefore(otStart)) otEnd = otEnd.add(1, "day");

          overtime_minutes += overlapMinutes(actualIn, actualOut, otStart, otEnd);
        }

        rowsToInsert.push({
          attendance_id: header.id,
          work_day,
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

      /**
       * =====================================================
       * SAVE SIGNATORIES ALWAYS
       * =====================================================
       */

      // Employee (order 1)
      const employeeAccount = await db.EmployeeAccount.findOne({
        where: { employee_id: emp.id },
        include: [
          {
            model: db.User,
            as: "user",
            where: { role: "Employee" },
          },
        ],
        transaction: tx,
      });

      if (employeeAccount) {
        const employeeSignatories = await db.ApprovalSetting.findAll({
          where: {
            owner_id: employeeAccount.user_id,
            type: "TimeCard",
            order: 1,
            is_active: true,
          },
          order: [["order", "ASC"]],
          transaction: tx,
        });

        for (const sig of employeeSignatories) {
          await db.Approval.create(
            {
              setting_id: sig.id,
              document_id: header.id,
              status: "Pending",
              signed_at: null,
              remarks: null,
              is_active: true,
            },
            { transaction: tx }
          );
        }
      }

      // Management (order >= 2)
      const managementAccount = await db.EmployeeAccount.findAll({
        include: [
          {
            model: db.User,
            as: "user",
            where: { role: "Management" },
          },
        ],
        transaction: tx,
      });
      
      if (managementAccount) {
        
        const managementSignatories = await db.ApprovalSetting.findAll({
          where: {
            owner_id: employeeAccount.user_id,
            type: "TimeCard",
            order: { [Op.gte]: 2 },
            is_active: true,
          },
          order: [["order", "ASC"]],
          transaction: tx,
        });
        for (const sig of managementSignatories) {
          await db.Approval.create(
            {
              setting_id: sig.id,
              document_id: header.id,
              status: "Pending",
              signed_at: null,
              remarks: null,
              is_active: true,
            },
            { transaction: tx }
          );
        }
      }
    }

    if (attendanceHeadersCreated === 0) {
      throw new Error("Nothing created. Either records exist or no employees found.");
    }

    await tx.commit();

    return res.status(201).json({
      message: "Attendance created successfully.",
      attendance_headers_created: attendanceHeadersCreated,
      attendance_days_created: attendanceDaysCreated,
    });
  } catch (error) {
    await tx.rollback();
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

// ✅ Common helpers (use as-is)
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


// // ✅ Common helpers you provided (use as-is)
// const pos = (n) => (n > 0 ? n : 0);

// const combineDayTime = (workDay, timeStr) => {
//     const t = (timeStr || "").trim();
//     // no time => invalid (so computations can skip safely)
//     if (!t) return moment.invalid();
//     // Accept HH:mm or HH:mm:ss
//     const m = moment(`${workDay} ${t}`, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"], true);
//     // If still invalid, try padding seconds
//     if (!m.isValid() && t.length === 5) {
//         return moment(`${workDay} ${t}:00`, "YYYY-MM-DD HH:mm:ss", true);
//     }
//     return m;
// };


// const pickEffectiveEmployeeShift = (employeeShifts, workDayYMD) => {
//     const day = moment(workDayYMD, "YYYY-MM-DD", true);
//     const valid = (employeeShifts || [])
//         .filter(es => es.is_active)
//         .filter(es => {
//             const from = moment(es.effective_from, "YYYY-MM-DD", true);
//             const to = es.effective_to ? moment(es.effective_to, "YYYY-MM-DD", true) : null;
//             return from.isSameOrBefore(day, "day") && (!to || to.isSameOrAfter(day, "day"));
//         })
//         .sort((a, b) => moment(b.effective_from).diff(moment(a.effective_from)));
//     return valid[0] || null;
// };

// const overlapMinutes = (aStart, aEnd, bStart, bEnd) => {
//     const start = moment.max(aStart, bStart);
//     const end = moment.min(aEnd, bEnd);
//     const diff = end.diff(start, "minutes");
//     return diff > 0 ? diff : 0;
// };

// // Approved overtime schedules for employee on workDay
// const getApprovedOvertimesForDay = async ({ employeeId, workDay, transaction }) => {
//     return db.EmployeeOvertimeApplication.findAll({
//         where: {
//             employee_id: employeeId,
//             status: "Approved",
//         },
//         include: [
//             {
//                 model: db.Overtime,
//                 as: "overtime",
//                 required: true,
//                 where: {
//                     date: workDay,
//                     status: "Approved",
//                     is_active: true,
//                 },
//             },
//         ],
//         transaction,
//     });
// };

// exports.GetAttendance = async (req, res) => {

//     const id = parseInt(req.params.id, 10);

//     // ✅ Helpers
//     const formatTime = (t) => (t ? moment(t, ["HH:mm:ss", "HH:mm"]).format("HH:mm") : "");
//     const formatTimeHHmmA = (t) => (t ? moment(t, ["HH:mm:ss", "HH:mm"]).format("hh:mm A") : "");

//     try {
//         // 1️⃣ Attendance period + daily records
//         const attendance = await db.Attendance.findOne({
//             where: { 
//                 id 
//             },
//             include: [
//                 {
//                     model: db.EmployeeAttendance,
//                     as: "days",
//                     separate: true,
//                     order: [["work_day", "ASC"]],
//                 },
//             ],
//         });

//         if (!attendance) return res.status(404).json({ error: "Attendance not found" });

//         const startDate = moment(attendance.date_from).format("YYYY-MM-DD");
//         const endDate = moment(attendance.date_to).format("YYYY-MM-DD");

//         // 1.5 Fetch EmployeeShift records (effective dating) + Shift + ShiftDays
//         // Shift hasMany ShiftDay as 'days' (day_of_week: 1=Mon..7=Sun)
//         const employeeShifts = await db.EmployeeShift.findAll({
//             where: { 
//                 employee_id: attendance.employee_id 
//             },
//             include: [
//                 {
//                     model: db.Shift,
//                     as: "shift",
//                     include: [
//                         { 
//                             model: db.ShiftDay, 
//                             as: "days" 
//                         }
//                     ],
//                 },
//             ],
//             order: [["effective_from", "DESC"]],
//         });

//         // 2️ Leaves
//         const leaves = await db.EmployeeLeaveApplication.findAll({
//             where: {
//                 employee_id: attendance.employee_id,
//                 status: "Approved",
//                 date_from: { [Op.lte]: endDate },
//                 date_to: { [Op.gte]: startDate },
//             },
//             include: [
//                 { 
//                     model: db.LeaveType, 
//                     as: "leaveType" 
//                 }
//             ],
//         });

//         // 3️ Holidays
//         const holidays = await db.Holiday.findAll({
//             where: {
//                 date: { [Op.between]: [startDate, endDate] },
//                 isActive: true,
//             },
//         });

//         // 4️ Overtime applications (range) for NOTES (fast map)
//         const overtimes = await db.EmployeeOvertimeApplication.findAll({
//             where: {
//                 employee_id: attendance.employee_id,
//                 status: "Approved",
//             },
//             include: [
//                 {
//                     model: db.Overtime,
//                     as: "overtime",
//                     required: true,
//                     where: {
//                         date: { [Op.between]: [startDate, endDate] },
//                         status: "Approved",
//                     },
//                 },
//             ],
//         });

//         // 5 Adjustments (latest first)
//         const adjustments = await db.EmployeeAttendanceAdjustment.findAll({
//             include: [
//                 {
//                     model: db.EmployeeAttendance,
//                     as: "attendance",
//                     required: true,
//                     where: { 
//                         attendance_id: attendance.id 
//                     },
//                 },
//             ],
//             order: [["createdAt", "DESC"]],
//         });

//         // 6 Lookup maps
//         const leaveMap = {};
//         for (const leave of leaves) {
//             let d = moment(leave.date_from);
//             const end = moment(leave.date_to);
//             while (d.isSameOrBefore(end)) {
//                 leaveMap[d.format("YYYY-MM-DD")] = leave.leaveType?.name || "";
//                 d.add(1, "day");
//             }
//         }

//         const holidayMap = {};
//         for (const h of holidays) {
//             holidayMap[moment(h.date).format("YYYY-MM-DD")] = h.name;
//         }

//         //  7 overtimeMap for remarks
//         const overtimeMap = {};
//         for (const otApp of overtimes) {
//             const ot = otApp.overtime;
//             const key = moment(ot.date).format("YYYY-MM-DD");
//             if (!overtimeMap[key]) overtimeMap[key] = [];
//             overtimeMap[key].push({
//                 start: ot.time_start ? formatTime(ot.time_start) : "",
//                 end: ot.time_end ? formatTime(ot.time_end) : "",
//                 description: ot.description || "",
//                 status: ot.status,
//             });
//         }

//         // dayMap
//         const dayMap = {};
//         for (const d of attendance.days || []) {
//             dayMap[moment(d.work_day).format("YYYY-MM-DD")] = d;
//         }

//         // latest adjustment per EmployeeAttendance.id
//         const adjustmentMap = {};
//         for (const adj of adjustments) {
//             if (!adjustmentMap[adj.employee_attendance_id]) {
//                 adjustmentMap[adj.employee_attendance_id] = adj; // newest wins
//             }
//         }

//         // 8 Build results
//         const results = [];
//         let day = moment(startDate);
//         const endDay = moment(endDate);

//         while (day.isSameOrBefore(endDay)) {
//             const formatted = day.format("YYYY-MM-DD");
//             const dtr = dayMap[formatted];

//             const notes = [];

//             // notes: holiday/leave/overtime(adjusted note)
//             if (holidayMap[formatted]) notes.push({ type: "holiday", name: holidayMap[formatted] });
//             if (leaveMap[formatted]) notes.push({ type: "leave", name: leaveMap[formatted] });

//             if (overtimeMap[formatted]?.length) {
//                 overtimeMap[formatted].forEach((ot) => {
//                     notes.push({
//                         type: "overtime",
//                         name: `ot (${formatTimeHHmmA(ot.start)} to ${formatTimeHHmmA(ot.end)})`,
//                     });
//                 });
//             }

//             const adjustment = dtr ? adjustmentMap[dtr.id] : null;
//             if (adjustment) notes.push({ type: "adjustment", name: adjustment.reason });

//             // time source: latest adjustment OR attendance
//             const originalTimeIn = formatTime(dtr?.time_in);
//             const originalTimeOut = formatTime(dtr?.time_out);

//             const adjustedTimeIn = adjustment ? formatTime(adjustment.adjusted_time_in) : null;
//             const adjustedTimeOut = adjustment ? formatTime(adjustment.adjusted_time_out) : null;

//             const finalTimeIn = adjustedTimeIn || originalTimeIn;
//             const finalTimeOut = adjustedTimeOut || originalTimeOut;

//             // Shift for this date (effective dated)
//             const effective = pickEffectiveEmployeeShift(employeeShifts, formatted);
//             const shift = effective?.shift || null;

//             // default computed
//             let late = 0;
//             let undertime = 0;
//             let overtime = 0;

//             // compute only if we have shift + actual times + shift day matches
//             if (shift && finalTimeIn && finalTimeOut) {
//                 // shift day validation (1=Mon..7=Sun)
//                 const shiftDaySet = new Set((shift.days || []).map(sd => Number(sd.day_of_week)));
//                 const isoDow = moment(formatted, "YYYY-MM-DD").isoWeekday();
//                 const isShiftDay = shiftDaySet.size ? shiftDaySet.has(isoDow) : true;

//                 // Scheduled times (rename if your Shift uses different columns)
//                 const schedInStr = shift.time_in || shift.time_start || shift.timeStart || shift.start_time;
//                 const schedOutStr = shift.time_out || shift.time_end || shift.timeEnd || shift.end_time;

//                 const schedStart = combineDayTime(formatted, schedInStr);
//                 const schedEnd = combineDayTime(formatted, schedOutStr);

//                 // Actual times (adjustment OR attendance)
//                 const actualStart = combineDayTime(formatted, finalTimeIn);
//                 const actualEnd = combineDayTime(formatted, finalTimeOut);

//                 // guard
//                 const schedOk = schedStart.isValid() && schedEnd.isValid() && schedEnd.isAfter(schedStart);
//                 const actualOk = actualStart.isValid() && actualEnd.isValid() && actualEnd.isAfter(actualStart);

//                 const isHoliday = !!holidayMap[formatted];
//                 const isLeave = !!leaveMap[formatted];

//                 if (schedOk && actualOk && isShiftDay && !isHoliday && !isLeave) {
//                     // late: actual start after scheduled start
//                     late = pos(actualStart.diff(schedStart, "minutes"));

//                     // undertime: actual end before scheduled end
//                     undertime = pos(schedEnd.diff(actualEnd, "minutes"));

//                     // overtime: only count approved OT minutes that overlap actual work window
//                     // Uses your helper (day-level OT schedules)
//                     const approvedOTs = await getApprovedOvertimesForDay({
//                         employeeId: attendance.employee_id,
//                         workDay: formatted,
//                         transaction: null,
//                     });

//                     overtime = 0;
//                     for (const otApp of approvedOTs || []) {
//                         const ot = otApp.overtime;
//                         if (!ot) continue;

//                         const otStart = combineDayTime(formatted, ot.time_start || ot.timeStart);
//                         const otEnd = combineDayTime(formatted, ot.time_end || ot.timeEnd);

//                         if (otStart.isValid() && otEnd.isValid() && otEnd.isAfter(otStart)) {
//                             overtime += overlapMinutes(actualStart, actualEnd, otStart, otEnd);
//                         }
//                     }
//                 }
//             }

//             results.push({
//                 date: formatted,
//                 // IDs
//                 attendance_id: dtr?.id || null,
//                 adjustment_id: adjustment?.id || null,

//                 // display times (adjusted wins)
//                 time_in: finalTimeIn,
//                 time_out: finalTimeOut,

//                 // optional audit fields
//                 original_time_in: originalTimeIn,
//                 original_time_out: originalTimeOut,
//                 adjusted_time_in: adjustedTimeIn,
//                 adjusted_time_out: adjustedTimeOut,

//                 // computed using (adjustment OR attendance) + (effective shift + shiftday) + (approved OT overlap)
//                 late,
//                 undertime,
//                 overtime,
//                 // notes
//                 notes,
//             });

//             day.add(1, "day");
//         }

//         // Approvals (unchanged)
//         const approvals = await db.Approval.findAll({
//             where: { 
//                 document_id: id, 
//                 is_active: true 
//             },
//             include: [
//                 {
//                     model: db.ApprovalSetting,
//                     as: "setting",
//                     where: { 
//                         type: "TimeCard" 
//                     },
//                     include: [
//                         {
//                             model: db.User,
//                             as: "approver",
//                             attributes: ["id"],
//                             include: [
//                                 {
//                                     model: db.EmployeeAccount,
//                                     as: "employeeAccount",
//                                     include: [
//                                         {
//                                             model: db.Employee,
//                                             as: "employee",
//                                             include: [
//                                                 {
//                                                     model: db.Employment,
//                                                     as: "employment",
//                                                     include: [
//                                                         { 
//                                                             model: db.Position, 
//                                                             as: "position" 
//                                                         }
//                                                     ],
//                                                 },
//                                                 {
//                                                     model: db.EmployeeSignature,
//                                                     as: 'signature'
//                                                 }
//                                             ],
//                                         },
//                                     ],
//                                 },
//                             ],
//                         },
//                         {
//                             model: db.User,
//                             as: "owner",
//                             attributes: ["id"],
//                             include: [
//                                 {
//                                     model: db.EmployeeAccount,
//                                     as: "employeeAccount",
//                                     include: [
//                                         {
//                                             model: db.Employee,
//                                             as: "employee",
//                                             include: [
//                                                 {
//                                                     model: db.Employment,
//                                                     as: "employment",
//                                                     include: [
//                                                         { 
//                                                             model: db.Position, 
//                                                             as: "position" 
//                                                         }
//                                                     ],
//                                                 },
//                                                 {
//                                                     model: db.EmployeeSignature,
//                                                     as: 'signature'
//                                                 }
//                                             ],
//                                         },
//                                     ],
//                                 },
//                             ],
//                         },
//                     ],
//                 },
//             ],
//             order: [[{ model: db.ApprovalSetting, as: "setting" }, "order", "ASC"]],
//         });

//         return res.json({
//             id: attendance.id,
//             employee_id: attendance.employee_id,
//             date_from: startDate,
//             date_to: endDate,
//             results,
//             approvals,
//         });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };

// exports.GetAttendance = async (req, res) => {
//   const id = parseInt(req.params.id, 10);

//   // ✅ Helpers (display only)
//   const formatTime = (t) => (t ? moment(t, ["HH:mm:ss", "HH:mm"]).format("HH:mm") : "");
//   const formatTimeHHmmA = (t) => (t ? moment(t, ["HH:mm:ss", "HH:mm"]).format("hh:mm A") : "");
//   const toNum = (v, fallback = 0) => {
//     const n = Number(v);
//     return Number.isFinite(n) ? n : fallback;
//   };

//   try {
//     // 1️⃣ Attendance period + daily records
//     const attendance = await db.Attendance.findOne({
//       where: { id },
//       include: [
//         {
//           model: db.EmployeeAttendance,
//           as: "days",
//           separate: true,
//           order: [["work_day", "ASC"]],
//         },
//       ],
//     });

//     if (!attendance) return res.status(404).json({ error: "Attendance not found" });

//     const startDate = moment(attendance.date_from).format("YYYY-MM-DD");
//     const endDate = moment(attendance.date_to).format("YYYY-MM-DD");

//     // 1.5 EmployeeShift (for shift day validation only)
//     const employeeShifts = await db.EmployeeShift.findAll({
//       where: { employee_id: attendance.employee_id },
//       include: [
//         {
//           model: db.Shift,
//           as: "shift",
//           include: [{ model: db.ShiftDay, as: "days" }],
//         },
//       ],
//       order: [["effective_from", "DESC"]],
//     });

//     // 2️⃣ Leaves
//     const leaves = await db.EmployeeLeaveApplication.findAll({
//       where: {
//         employee_id: attendance.employee_id,
//         status: "Approved",
//         date_from: { [Op.lte]: endDate },
//         date_to: { [Op.gte]: startDate },
//       },
//       include: [{ model: db.LeaveType, as: "leaveType" }],
//     });

//     // 3️⃣ Holidays
//     const holidays = await db.Holiday.findAll({
//       where: {
//         date: { [Op.between]: [startDate, endDate] },
//         isActive: true,
//       },
//     });

//     // 4️⃣ Overtime apps for NOTES only
//     const overtimes = await db.EmployeeOvertimeApplication.findAll({
//       where: {
//         employee_id: attendance.employee_id,
//         status: "Approved",
//       },
//       include: [
//         {
//           model: db.Overtime,
//           as: "overtime",
//           required: true,
//           where: {
//             date: { [Op.between]: [startDate, endDate] },
//             status: "Approved",
//           },
//         },
//       ],
//     });

//     // 5️⃣ Adjustments (latest first) under this attendance header
//     const adjustments = await db.EmployeeAttendanceAdjustment.findAll({
//       include: [
//         {
//           model: db.EmployeeAttendance,
//           as: "attendance",
//           required: true,
//           where: { attendance_id: attendance.id },
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     // 6️⃣ Lookup maps
//     const leaveMap = {};
//     for (const leave of leaves) {
//       let d = moment(leave.date_from);
//       const e = moment(leave.date_to);
//       while (d.isSameOrBefore(e, "day")) {
//         leaveMap[d.format("YYYY-MM-DD")] = leave.leaveType?.name || "";
//         d.add(1, "day");
//       }
//     }

//     const holidayMap = {};
//     for (const h of holidays) {
//       holidayMap[moment(h.date).format("YYYY-MM-DD")] = h.name;
//     }

//     // overtimeMap for NOTES only
//     const overtimeMap = {};
//     for (const otApp of overtimes) {
//       const ot = otApp.overtime;
//       const key = moment(ot.date).format("YYYY-MM-DD");
//       if (!overtimeMap[key]) overtimeMap[key] = [];
//       overtimeMap[key].push({
//         start: ot.time_start ? formatTime(ot.time_start) : "",
//         end: ot.time_end ? formatTime(ot.time_end) : "",
//         description: ot.description || "",
//         status: ot.status,
//       });
//     }

//     // dayMap from EmployeeAttendance
//     const dayMap = {};
//     for (const d of attendance.days || []) {
//       dayMap[moment(d.work_day).format("YYYY-MM-DD")] = d;
//     }

//     // latest adjustment per employee_attendance_id
//     const adjustmentMap = {};
//     for (const adj of adjustments) {
//       if (!adjustmentMap[adj.employee_attendance_id]) {
//         adjustmentMap[adj.employee_attendance_id] = adj; // newest wins
//       }
//     }

//     // 8️⃣ Build results (NO COMPUTATION; values come from EmployeeAttendance, overridden by Adjustment)
//     const results = [];
//     let day = moment(startDate, "YYYY-MM-DD");
//     const endDay = moment(endDate, "YYYY-MM-DD");

//     while (day.isSameOrBefore(endDay, "day")) {
//       const formatted = day.format("YYYY-MM-DD");
//       const dtr = dayMap[formatted];

//       const notes = [];

//       if (holidayMap[formatted]) notes.push({ type: "holiday", name: holidayMap[formatted] });
//       if (leaveMap[formatted]) notes.push({ type: "leave", name: leaveMap[formatted] });

//       if (overtimeMap[formatted]?.length) {
//         overtimeMap[formatted].forEach((ot) => {
//           notes.push({
//             type: "overtime",
//             name: `ot (${formatTimeHHmmA(ot.start)} to ${formatTimeHHmmA(ot.end)})`,
//           });
//         });
//       }

//       const adjustment = dtr ? adjustmentMap[dtr.id] : null;
//       if (adjustment) notes.push({ type: "adjustment", name: adjustment.reason });

//       // time source: adjustment wins if present, else EmployeeAttendance
//       const originalTimeIn = formatTime(dtr?.time_in);
//       const originalTimeOut = formatTime(dtr?.time_out);

//       const adjustedTimeIn = adjustment ? formatTime(adjustment.adjusted_time_in) : null;
//       const adjustedTimeOut = adjustment ? formatTime(adjustment.adjusted_time_out) : null;

//       const finalTimeIn = adjustedTimeIn || originalTimeIn;
//       const finalTimeOut = adjustedTimeOut || originalTimeOut;

//       // ✅ NO COMPUTATION:
//       // Get saved values from EmployeeAttendance, but if adjustment has values, adjustment wins.
//       const baseLate = toNum(dtr?.late_minutes ?? dtr?.late ?? 0, 0);
//       const baseUndertime = toNum(dtr?.undertime_minutes ?? dtr?.undertime ?? 0, 0);
//       const baseOvertime = toNum(dtr?.overtime_minutes ?? dtr?.overtime ?? 0, 0);

//       const adjLate =
//         adjustment && adjustment.late_minutes != null
//           ? toNum(adjustment.late_minutes, baseLate)
//           : baseLate;

//       const adjUndertime =
//         adjustment && adjustment.undertime_minutes != null
//           ? toNum(adjustment.undertime_minutes, baseUndertime)
//           : baseUndertime;

//       const adjOvertime =
//         adjustment && adjustment.overtime_minutes != null
//           ? toNum(adjustment.overtime_minutes, baseOvertime)
//           : baseOvertime;

//       results.push({
//         date: formatted,

//         attendance_id: dtr?.id || null,
//         adjustment_id: adjustment?.id || null,

//         time_in: finalTimeIn,
//         time_out: finalTimeOut,

//         original_time_in: originalTimeIn,
//         original_time_out: originalTimeOut,
//         adjusted_time_in: adjustedTimeIn,
//         adjusted_time_out: adjustedTimeOut,

//         // ✅ saved values only (adjustment overrides if has value)
//         late: adjLate,
//         undertime: adjUndertime,
//         overtime: adjOvertime,

//         notes,
//       });

//       day.add(1, "day");
//     }

//     // Approvals (unchanged)
//     const approvals = await db.Approval.findAll({
//       where: {
//         document_id: id,
//         is_active: true,
//       },
//       include: [
//         {
//           model: db.ApprovalSetting,
//           as: "setting",
//           where: { type: "TimeCard" },
//           include: [
//             {
//               model: db.User,
//               as: "approver",
//               attributes: ["id"],
//               include: [
//                 {
//                   model: db.EmployeeAccount,
//                   as: "employeeAccount",
//                   include: [
//                     {
//                       model: db.Employee,
//                       as: "employee",
//                       include: [
//                         {
//                           model: db.Employment,
//                           as: "employment",
//                           include: [{ model: db.Position, as: "position" }],
//                         },
//                         { model: db.EmployeeSignature, as: "signature" },
//                       ],
//                     },
//                   ],
//                 },
//               ],
//             },
//             {
//               model: db.User,
//               as: "owner",
//               attributes: ["id"],
//               include: [
//                 {
//                   model: db.EmployeeAccount,
//                   as: "employeeAccount",
//                   include: [
//                     {
//                       model: db.Employee,
//                       as: "employee",
//                       include: [
//                         {
//                           model: db.Employment,
//                           as: "employment",
//                           include: [{ model: db.Position, as: "position" }],
//                         },
//                         { model: db.EmployeeSignature, as: "signature" },
//                       ],
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//       order: [[{ model: db.ApprovalSetting, as: "setting" }, "order", "ASC"]],
//     });

//     return res.json({
//       id: attendance.id,
//       employee_id: attendance.employee_id,
//       date_from: startDate,
//       date_to: endDate,
//       results,
//       approvals,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

exports.GetAttendance = async (req, res) => {
  const id = parseInt(req.params.id, 10);

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
  // return the whole signature object or just a field like signature.image/signature_path
  return user?.employeeAccount?.employee?.signature || null;
};

const getEmployeePosition = (user) => {
  return (
    user?.employeeAccount?.employee?.employment?.position?.name ||
    user?.employeeAccount?.employee?.employment?.position?.title ||
    ''
  );
};

// ✅ Common helpers (same as your Create)
// const pos = (n) => (n > 0 ? n : 0);

// const combineDayTime = (workDay, timeStr) => {
//   const t = (timeStr || "").trim();
//   if (!t) return moment.invalid();
//   const m = moment(`${workDay} ${t}`, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"], true);
//   if (!m.isValid() && t.length === 5) {
//     return moment(`${workDay} ${t}:00`, "YYYY-MM-DD HH:mm:ss", true);
//   }
//   return m;
// };

// const pickEffectiveEmployeeShift = (employeeShifts, workDayYMD) => {
//   const day = moment(workDayYMD, "YYYY-MM-DD", true);
//   const valid = (employeeShifts || [])
//     .filter(es => es.is_active)
//     .filter(es => {
//       const from = moment(es.effective_from, "YYYY-MM-DD", true);
//       const to = es.effective_to ? moment(es.effective_to, "YYYY-MM-DD", true) : null;
//       return from.isSameOrBefore(day, "day") && (!to || to.isSameOrAfter(day, "day"));
//     })
//     .sort((a, b) => moment(b.effective_from).diff(moment(a.effective_from)));
//   return valid[0] || null;
// };

// const overlapMinutes = (aStart, aEnd, bStart, bEnd) => {
//   const start = moment.max(aStart, bStart);
//   const end = moment.min(aEnd, bEnd);
//   const diff = end.diff(start, "minutes");
//   return diff > 0 ? diff : 0;
// };

// const getApprovedOvertimesForDay = async ({ employeeId, workDay, transaction }) => {
//   return db.EmployeeOvertimeApplication.findAll({
//     where: {
//       employee_id: employeeId,
//       status: "Approved",
//     },
//     include: [
//       {
//         model: db.Overtime,
//         as: "overtime",
//         required: true,
//         where: {
//           date: workDay,
//           status: "Approved",
//           is_active: true,
//         },
//       },
//     ],
//     transaction,
//   });
// };


// exports.Update = async (req, res) => {

//     const attendanceId = parseInt(req.params.id, 10); // Attendance.id (period)
//     const { 
//         logs 
//     } = req.body;

//     const tx = await db.sequelize.transaction();
//     try {
//         if (!Array.isArray(logs)) {
//             return res.status(400).json({ error: "logs must be an array" });
//         }

//         const userId = req.user?.id;
//         if (!userId) {
//             return res.status(400).json({ error: "Missing req.user.id" });
//         }

//         const attendance = await db.Attendance.findByPk(attendanceId, { transaction: tx });
//         if (!attendance) {
//             await tx.rollback();
//             return res.status(404).json({ error: "Attendance not found" });
//         }

//         // Helpers
//         const norm = (v) => (v == null ? "" : String(v).trim());
//         const hasTimePair = (r) => norm(r.time_in) && norm(r.time_out);

//         // Keep only rows that matter:
//         // - create attendance rows if no attendance_id but has times
//         // - create adjustments if attendance_id and times changed
//         const rows = logs
//             .filter(r => r?.date)
//             .filter(r => (!r.attendance_id && hasTimePair(r)) || (r.attendance_id && hasTimePair(r)));

//         if (rows.length === 0) {
//             await tx.commit();
//             return res.status(201).json({ message: "Record Saved!", createdAttendances: 0, createdAdjustments: 0 });
//         }

//         // Prefetch existing EmployeeAttendance by (attendance_id, work_day) to avoid duplicates
//         const createDates = rows
//             .filter(r => !r.attendance_id)
//             .map(r => r.date);

//         const existingDays = createDates.length
//             ? await db.EmployeeAttendance.findAll({
//                 where: { attendance_id: attendanceId, work_day: { [Op.in]: createDates } },
//                 attributes: ["id", "work_day"],
//                 transaction: tx
//                 })
//             : [];

//         const existingByDate = {};
//         for (const d of existingDays) existingByDate[d.work_day] = d.id;

//         let createdAttendances = 0;
//         let createdAdjustments = 0;

//         for (const r of rows) {
//             const workDay = r.date;

//             // 1) CREATE EmployeeAttendance if missing and has times
//             if (!r.attendance_id) {
//                 if (existingByDate[workDay]) continue;

//                 await db.EmployeeAttendance.create(
//                     {
//                         attendance_id: attendanceId,
//                         work_day: workDay,
//                         time_in: norm(r.time_in),
//                         time_out: norm(r.time_out),
//                         late_minutes: Number(r.late) || 0,
//                         undertime_minutes: Number(r.undertime) || 0,
//                         overtime_minutes: Number(r.overtime) || 0,
//                         is_locked: false,
//                         locked_at: null
//                     },
//                     { transaction: tx }
//                 );
//                 createdAttendances++;
//                 continue;
//             }

//             // 2) ALWAYS CREATE a new adjustment (never update any existing one)
//             // Only create an adjustment when user changed time vs original
//             const originalIn = norm(r.original_time_in);
//             const originalOut = norm(r.original_time_out);
//             const newIn = norm(r.time_in);
//             const newOut = norm(r.time_out);

//             const changed = (newIn && newIn !== originalIn) || (newOut && newOut !== originalOut);
//             if (!changed) continue;

//             const notes = Array.isArray(r.notes) ? r.notes : [];
//             const adjNote = notes.find(n => n?.type === "adjustment");
//             const reason = norm(adjNote?.reason || adjNote?.name || r.reason || "Adjusted via DTR update");
//             if (!reason) {
//                 await tx.rollback();
//                 return res.status(400).json({ error: `Adjustment reason required for ${workDay}` });
//             }

//             await db.EmployeeAttendanceAdjustment.create(
//                 {
//                     employee_attendance_id: r.attendance_id,
//                     adjusted_time_in: newIn,
//                     adjusted_time_out: newOut,
//                     reason,
//                     created_by_user_id: userId
//                 },
//                 { transaction: tx }
//             );

//             createdAdjustments++;
//         }

//         await tx.commit();

//         return res.status(201).json({
//             message: "Record Saved!",
//             createdAttendances,
//             createdAdjustments
//         });

//   } catch (error) {

//     await tx.rollback();
//     return res.status(400).json({ error: error.message });

//   }
// };

exports.Update = async (req, res) => {
  const attendanceId = parseInt(req.params.id, 10); // Attendance.id (period)
  const { logs } = req.body;

  const tx = await db.sequelize.transaction();

  try {
    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: "logs must be an array" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: "Missing req.user.id" });
    }

    const attendance = await db.Attendance.findByPk(attendanceId, { transaction: tx });
    if (!attendance) {
      await tx.rollback();
      return res.status(404).json({ error: "Attendance not found" });
    }

    // ✅ fetch shifts once (needed for computing minutes)
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
      transaction: tx,
    });

    // Helpers
    const norm = (v) => (v == null ? "" : String(v).trim());
    const hasTimePair = (r) => norm(r.time_in) && norm(r.time_out);

    // Keep only rows that matter
    const rows = logs
      .filter(r => r?.date)
      .filter(r => (!r.attendance_id && hasTimePair(r)) || (r.attendance_id && hasTimePair(r)));

    if (rows.length === 0) {
      await tx.commit();
      return res.status(201).json({
        message: "Record Saved!",
        createdAttendances: 0,
        createdAdjustments: 0
      });
    }

    // Prefetch existing EmployeeAttendance by (attendance_id, work_day)
    const createDates = rows
      .filter(r => !r.attendance_id)
      .map(r => r.date);

    const existingDays = createDates.length
      ? await db.EmployeeAttendance.findAll({
          where: { attendance_id: attendanceId, work_day: { [Op.in]: createDates } },
          attributes: ["id", "work_day"],
          transaction: tx
        })
      : [];

    const existingByDate = {};
    for (const d of existingDays) existingByDate[d.work_day] = d.id;

    let createdAttendances = 0;
    let createdAdjustments = 0;

    for (const r of rows) {
      const workDay = r.date;

      // 1) CREATE EmployeeAttendance if missing and has times
      if (!r.attendance_id) {
        if (existingByDate[workDay]) continue;

        const newIn = norm(r.time_in);
        const newOut = norm(r.time_out);

        // ✅ compute base late/undertime/overtime based on time_in/time_out + shift + approved OT
        const computedBase = await computeMinutesFromShiftAndOT({
          employeeShifts,
          employeeId: attendance.employee_id,
          workDay,
          time_in: newIn,
          time_out: newOut,
          transaction: tx
        });

        await db.EmployeeAttendance.create(
          {
            attendance_id: attendanceId,
            work_day: workDay,
            time_in: newIn,
            time_out: newOut,

            // ✅ COMPUTED (base minutes)
            late_minutes: computedBase.late_minutes,
            undertime_minutes: computedBase.undertime_minutes,
            overtime_minutes: computedBase.overtime_minutes,

            is_locked: false,
            locked_at: null
          },
          { transaction: tx }
        );

        createdAttendances++;
        continue;
      }

      // 2) CREATE a new adjustment if time changed vs original
      const originalIn = norm(r.original_time_in);
      const originalOut = norm(r.original_time_out);
      const newIn = norm(r.time_in);
      const newOut = norm(r.time_out);

      const changed = (newIn && newIn !== originalIn) || (newOut && newOut !== originalOut);
      if (!changed) continue;

      const notes = Array.isArray(r.notes) ? r.notes : [];
      const adjNote = notes.find(n => n?.type === "adjustment");
      const reason = norm(adjNote?.reason || adjNote?.name || r.reason || "Adjusted via DTR update");

      if (!reason) {
        await tx.rollback();
        return res.status(400).json({ error: `Adjustment reason required for ${workDay}` });
      }

      // ✅ compute adjusted late/undertime/overtime using adjusted time + shift + approved OT overlap
      const computedAdj = await computeMinutesFromShiftAndOT({
        employeeShifts,
        employeeId: attendance.employee_id,
        workDay,
        time_in: newIn,
        time_out: newOut,
        transaction: tx
      });

      await db.EmployeeAttendanceAdjustment.create(
        {
          employee_attendance_id: r.attendance_id,
          adjusted_time_in: newIn,
          adjusted_time_out: newOut,
          reason,
          created_by_user_id: userId,

          // ✅ NEW computed fields (adjustment prevails)
          adjusted_late_minutes: computedAdj.late_minutes,
          adjusted_undertime_minutes: computedAdj.undertime_minutes,
          adjusted_overtime_minutes: computedAdj.overtime_minutes
        },
        { transaction: tx }
      );

      createdAdjustments++;
    }

    await tx.commit();

    return res.status(201).json({
      message: "Record Saved!",
      createdAttendances,
      createdAdjustments
    });

  } catch (error) {
    await tx.rollback();
    return res.status(400).json({ error: error.message });
  }
};


//
// ✅ COMPUTE helper (same logic as your Create)
//
async function computeMinutesFromShiftAndOT({ employeeShifts, employeeId, workDay, time_in, time_out, transaction }) {
  if (!time_in || !time_out) {
    return { late_minutes: 0, undertime_minutes: 0, overtime_minutes: 0 };
  }

  const effectiveES = pickEffectiveEmployeeShift(employeeShifts, workDay);
  const shift = effectiveES?.shift;

  if (!shift) {
    return { late_minutes: 0, undertime_minutes: 0, overtime_minutes: 0 };
  }

  // ShiftDays numeric 1..7
  const allowedDays = new Set((shift.days || []).map(d => Number(d.day_of_week)));
  const dow = moment(workDay, "YYYY-MM-DD", true).isoWeekday();
  if (allowedDays.size && !allowedDays.has(dow)) {
    return { late_minutes: 0, undertime_minutes: 0, overtime_minutes: 0 };
  }

  const actualIn = combineDayTime(workDay, time_in);
  const actualOut = combineDayTime(workDay, time_out);

  if (!actualIn.isValid() || !actualOut.isValid()) {
    return { late_minutes: 0, undertime_minutes: 0, overtime_minutes: 0 };
  }

  // actual crosses midnight
  if (actualOut.isBefore(actualIn)) actualOut.add(1, "day");

  const shiftStart = combineDayTime(workDay, shift.start_time);
  let shiftEnd = combineDayTime(workDay, shift.end_time);
  if (shift.crosses_midnight) shiftEnd = shiftEnd.add(1, "day");

  const grace = Number(shift.grace_minutes) || 0;

  const late_minutes = pos(
    actualIn.diff(shiftStart.clone().add(grace, "minutes"), "minutes")
  );

  const undertime_minutes = pos(
    shiftEnd.diff(actualOut, "minutes")
  );

  // Approved OT overlap
  const otApps = await getApprovedOvertimesForDay({
    employeeId,
    workDay,
    transaction
  });

  let overtime_minutes = 0;

  for (const app of otApps) {
    const ot = app.overtime;
    if (!ot) continue;

    let otStart = combineDayTime(workDay, ot.time_start);
    let otEnd = combineDayTime(workDay, ot.time_end);

    if (!otStart.isValid() || !otEnd.isValid()) continue;

    // OT crosses midnight
    if (otEnd.isBefore(otStart)) otEnd = otEnd.add(1, "day");

    overtime_minutes += overlapMinutes(actualIn, actualOut, otStart, otEnd);
  }

  return { late_minutes, undertime_minutes, overtime_minutes };
}


// ✅ Common helpers (same as your Create)
// const pos = (n) => (n > 0 ? n : 0);

// const combineDayTime = (workDay, timeStr) => {
//   const t = (timeStr || "").trim();
//   if (!t) return moment.invalid();
//   const m = moment(`${workDay} ${t}`, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"], true);
//   if (!m.isValid() && t.length === 5) {
//     return moment(`${workDay} ${t}:00`, "YYYY-MM-DD HH:mm:ss", true);
//   }
//   return m;
// };

// const pickEffectiveEmployeeShift = (employeeShifts, workDayYMD) => {
//   const day = moment(workDayYMD, "YYYY-MM-DD", true);
//   const valid = (employeeShifts || [])
//     .filter(es => es.is_active)
//     .filter(es => {
//       const from = moment(es.effective_from, "YYYY-MM-DD", true);
//       const to = es.effective_to ? moment(es.effective_to, "YYYY-MM-DD", true) : null;
//       return from.isSameOrBefore(day, "day") && (!to || to.isSameOrAfter(day, "day"));
//     })
//     .sort((a, b) => moment(b.effective_from).diff(moment(a.effective_from)));
//   return valid[0] || null;
// };

// const overlapMinutes = (aStart, aEnd, bStart, bEnd) => {
//   const start = moment.max(aStart, bStart);
//   const end = moment.min(aEnd, bEnd);
//   const diff = end.diff(start, "minutes");
//   return diff > 0 ? diff : 0;
// };

// const getApprovedOvertimesForDay = async ({ employeeId, workDay, transaction }) => {
//   return db.EmployeeOvertimeApplication.findAll({
//     where: {
//       employee_id: employeeId,
//       status: "Approved",
//     },
//     include: [
//       {
//         model: db.Overtime,
//         as: "overtime",
//         required: true,
//         where: {
//           date: workDay,
//           status: "Approved",
//           is_active: true,
//         },
//       },
//     ],
//     transaction,
//   });
// };



exports.Approve = async (req, res) => {

    const { 
        id
    } = req.params;
    const { approvalid } = req.body;

    try {

        const attendance = await db.Attendance.findByPk(id);
        
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

        const approval = await db.Approval.findByPk(approvalid);

        await approval.update({
            status: 'Approved',
            signed_at: new Date()
        })
        const approvals = await db.Approval.count({
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

exports.Overide = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { signatories } = req.body; // [2, 3]

    const transaction = await sequelize.transaction();

    try {

        const attendance = await db.Attendance.findByPk(id);
        
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

        const appcount = await db.Approval.count({
            where: {
                document_id: id,
                status: { [Op.ne]: "Approved" }
            }
        });
        if (appcount === 0) {
            await attendance.update({ 
                status: 'Approved'
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
        const signatories = approvals.map((app) => {
            const employee = app?.setting?.approver?.employeeAccount?.employee;
            const profile = employee || {};

            const position = employee?.employment?.position?.name;
            // Format full name (First M. Last Suffix)
            const first = profile?.first_name || '';
            const middle = profile?.middle_name ? `${profile.middle_name.charAt(0)}.` : '';
            const last = profile?.last_name || '';
            const suffix = profile?.suffix ? ` ${profile.suffix}` : '';
            const userName = `${first} ${middle} ${last}${suffix}`.replace(/\s+/g, ' ').trim();

            // Only show signature & date if approval is approved
            const isApproved = app?.status === 'Approved';
            const signaturePath = employee?.signature?.signature; // Assuming approval setting stores the signature path

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
            logs: results,
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