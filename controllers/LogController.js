const { Op } = require("sequelize");

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');
const momentTz = require('moment-timezone')

const pug = require('pug');
const puppeteer = require('puppeteer');

const db = require('../models');
const { sequelize } = db;

exports.GetAll = async (req, res) => {
    const Page = parseInt(req.query.Page, 10) || 1
    const Limit = parseInt(req.query.Limit, 10) || 10
    const Filter = (req.query.Filter || '').trim()
    const Offset = (Page - 1) * Limit

    try {
        const where = Filter
            ? {
                [Op.or]: [
                    { first_name: { [Op.like]: `%${Filter}%` } },
                    { middle_name: { [Op.like]: `%${Filter}%` } },
                    { last_name: { [Op.like]: `%${Filter}%` } },
                ],
                }
            : {}

        const { count, rows } = await db.Employee.findAndCountAll({
            attributes: ['id', 'first_name', 'middle_name', 'last_name', 'status'],
            where,
            distinct: true,
            subQuery: false,
            limit: Limit,
            offset: Offset,
            order: [['createdAt', 'DESC']],
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

exports.Create = async (req, res) => {

    const { 
        dateStart,
        dateEnd
    } = req.body;

    try {

        const existingAttendance = await EmployeeAttendance.findOne({
            where: {
                date_start: dateStart,
                date_end: dateEnd
            }
        });

        if (existingAttendance) {
            return res.status(400).json({
                message: 'Attendance for this period already exists.'
            });
        }

        // 1️⃣ Get all employee accounts
        const accounts = await EmployeeAccount.findAll();

        // 2️⃣ Loop through employees
        for (const emp of accounts) {
            // 2a️⃣ Create attendance
            const attendance = await EmployeeAttendance.create({
                employee_id: emp.employee_id,
                date_start: dateStart,
                date_end: dateEnd,
                status: 'Pending'
            });

            // 2b️⃣ Assign DTRs
            await DailyTimeRecord.update(
                { attendance_id: attendance.id },
                {
                    where: {
                        employee_id: emp.employee_id,
                        date: { [Op.between]: [attendance.date_start, attendance.date_end] }
                    }
                }
            );

            // 2c️⃣ Fetch approval settings for this employee
            const empSignatories = await ApprovalSetting.findAll({
                where: {
                    owner_id: emp.user_id,
                    type: 'TimeCard',
                    is_active: true
                },
                order: [['order', 'ASC']]
            });

            // 2d️⃣ Create approvals
            for (const sig of empSignatories) {
                const isFirstApprover = sig.order === 1; // first approver auto-approve

                await Approval.create({
                    setting_id: sig.id,
                    document_id: attendance.id,
                    status: isFirstApprover ? 'Approved' : 'Pending',
                    signed_at: isFirstApprover ? new Date() : null,
                    remarks: isFirstApprover ? 'Auto-approved (owner is first approver)' : null,
                    is_active: true
                });
            }
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

exports.GetLog = async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const month = Number(req.query.month)
  const year = Number(req.query.year)

  try {
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' })
    }

    // 📅 Build date range
    const startDate = moment(`${year}-${String(month).padStart(2, '0')}-01`, 'YYYY-MM-DD')
      .startOf('month')
      .toDate()

    const endDate = moment(`${year}-${String(month).padStart(2, '0')}-01`, 'YYYY-MM-DD')
      .endOf('month')
      .toDate()

    // 1️⃣ Fetch ALL logs for employee in month
    const logs = await db.EmployeeLog.findAll({
      where: {
        employee_id: id,
        captured_at: { [Op.between]: [startDate, endDate] }
      },
      order: [['captured_at', 'ASC']]
    })

    // 2️⃣ Approved leave applications
    const leaves = await db.EmployeeLeaveApplication.findAll({
      where: {
        employee_id: id,
        status: 'Approved',
        date_from: { [Op.lte]: endDate },
        date_to: { [Op.gte]: startDate }
      },
      include: [{ model: db.LeaveType, as: 'leaveType' }]
    })

    // 3️⃣ Holidays
    const holidays = await db.Holiday.findAll({
      where: {
        date: { [Op.between]: [startDate, endDate] },
        isActive: true
      }
    })

    // 4️⃣ Approved overtime
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

    // 5️⃣ Build lookup maps
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

    // 6️⃣ Generate DTR
    const result = []
    let day = moment(startDate)
    const endDay = moment(endDate)

    while (day.isSameOrBefore(endDay)) {
      const dateKey = day.format('YYYY-MM-DD')

      const times = logs
  .filter(l => moment.utc(l.captured_at).format('YYYY-MM-DD') === dateKey)
  .map(l => moment.utc(l.captured_at).format('HH:mm'))


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

    // 7️⃣ Response
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
