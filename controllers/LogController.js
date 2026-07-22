const { Op } = require("sequelize");

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');
const momentTz = require('moment-timezone')
const XLSX = require('xlsx');

const pug = require('pug');
const puppeteer = require('puppeteer-core');

const db = require('../models');
const { sequelize } = db;

exports.GetAll = async (req, res) => {

    const Page = parseInt(req.query.Page) || 1;
    const Limit = parseInt(req.query.Limit) || 10;
    const Filter = req.query.Filter ? req.query.Filter.trim() : "";
    const Offset = (Page - 1) * Limit;

    try {

        const { count, rows } = await db.Employee.findAndCountAll({
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
            where: {
                [Op.and]: [
                    Filter
                    ? {
                        [Op.or]: [
                            { '$employment.position.name$': { [Op.like]: `%${Filter}%` } },
                            { 'first_name': { [Op.like]: `%${Filter}%` } },
                            { 'middle_name': { [Op.like]: `%${Filter}%` } },
                            { 'last_name': { [Op.like]: `%${Filter}%` } }
                        ]
                        }
                    : {}
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

exports.GetLog = async (req, res) => {
    const id = parseInt(req.params.id, 10)
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

        // while (day.isSameOrBefore(endDay)) {
        //     const dateKey = day.format('YYYY-MM-DD')

        //     const times = logs
        //         .filter(l => moment(l.captured_at).format('YYYY-MM-DD') === dateKey)
        //         .map(l => moment(l.captured_at).format('hh:mm A'))

        //     const paddedTimes =
        //         times.length < 10
        //             ? [...times, ...Array(10 - times.length).fill('')]
        //             : times.slice(0, 10)

        //     result.push({
        //         date: dateKey,
        //         times: paddedTimes,
        //         leaveType: leaveMap[dateKey] || '',
        //         holiday: holidayMap[dateKey] || '',
        //         overtime: overtimeMap[dateKey]?.length ? 'Overtime' : ''
        //     })

        //     day.add(1, 'day')
        // }

        // First pass: determine the max number of time punches across all days
        let maxTimes = 0;
        const tempDay = day.clone();
        while (tempDay.isSameOrBefore(endDay)) {
            const dateKey = tempDay.format('YYYY-MM-DD');
            const count = logs.filter(l => moment(l.captured_at).format('YYYY-MM-DD') === dateKey).length;
            if (count > maxTimes) maxTimes = count;
            tempDay.add(1, 'day');
        }

        // Second pass: build the result, padding every day to maxTimes
        while (day.isSameOrBefore(endDay)) {
            const dateKey = day.format('YYYY-MM-DD');

            const times = logs
                .filter(l => moment(l.captured_at).format('YYYY-MM-DD') === dateKey)
                .map(l => moment(l.captured_at).format('hh:mm A'));

            const paddedTimes =
                times.length < maxTimes
                    ? [...times, ...Array(maxTimes - times.length).fill('')]
                    : times;

            result.push({
                date: dateKey,
                times: paddedTimes,
                leaveType: leaveMap[dateKey] || '',
                holiday: holidayMap[dateKey] || '',
                overtime: overtimeMap[dateKey]?.length ? 'Overtime' : ''
            });

            day.add(1, 'day');
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

exports.ImportLog = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            error: 'No file uploaded. Attach the xlsx under field name "file".'
        });
    }

    const transaction = await sequelize.transaction();

    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

        if (!rows.length) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Excel file is empty.' });
        }

        // Cache biometric_no -> employee_id lookups so we don't hit the DB once per row
        const employmentCache = new Map();
        const skipped = [];
        const toInsert = [];

        for (const row of rows) {
            // Spreadsheet "Emp ID" matches Employment.biometric_no
            const biometricNo = parseInt(row['Emp ID'], 10);

            if (isNaN(biometricNo)) {
                skipped.push({
                    empCode: row['Emp ID'],
                    name: `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim(),
                    reason: 'Invalid/non-numeric Emp ID'
                });
                continue;
            }

            if (!employmentCache.has(biometricNo)) {
                const employment = await db.Employment.findOne({
                    where: { biometric_no: biometricNo },
                    transaction
                });
                employmentCache.set(biometricNo, employment || null);
            }

            const employment = employmentCache.get(biometricNo);

            if (!employment) {
                skipped.push({
                    empCode: biometricNo,
                    name: `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim(),
                    reason: 'No Employment record found for this biometric_no'
                });
                continue;
            }

            const capturedAt = parseDateTime(row['Date'], row['Time']);

            if (!capturedAt) {
                skipped.push({
                    empCode: biometricNo,
                    reason: `Invalid date/time: ${row['Date']} ${row['Time']}`
                });
                continue;
            }

            toInsert.push({
                employee_id: employment.employee_id,
                captured_at: capturedAt,
                // Placeholder values — spreadsheet has no data for these fields
                recognition_score: 1.0000,
                liveness_passed: true,
                camera_id: 'IMPORTED',
                device_id: 'IMPORTED',
                source: 'Kiosk',
                geo_lat: 0,
                geo_lng: 0,
                image_path: Buffer.from(''),
                image_hash: '0'.repeat(64),
                payload_hash: '0'.repeat(64)
            });
        }

        if (!toInsert.length) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'No valid rows to import.',
                skipped
            });
        }

        const created = await db.EmployeeLog.bulkCreate(toInsert, { transaction });

        await transaction.commit();

        return res.status(201).json({
            message: 'Import complete.',
            totalRows: rows.length,
            createdCount: created.length,
            skippedCount: skipped.length,
            skipped
        });

    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({ error: error.message });
    }
};

function parseDateTime(dateVal, timeVal) {
    if (!dateVal || !timeVal) return null;
 
    // xlsx may hand back Date objects or strings depending on cell formatting
    let datePart;
    if (dateVal instanceof Date) {
        datePart = dateVal;
    } else {
        datePart = new Date(dateVal);
    }
 
    if (isNaN(datePart.getTime())) return null;
 
    let hours = 0, minutes = 0, seconds = 0;
 
    if (timeVal instanceof Date) {
        hours = timeVal.getUTCHours();
        minutes = timeVal.getUTCMinutes();
        seconds = timeVal.getUTCSeconds();
    } else if (typeof timeVal === 'string') {
        const parts = timeVal.split(':').map(Number);
        [hours, minutes, seconds] = [parts[0] || 0, parts[1] || 0, parts[2] || 0];
    }
 
    const combined = new Date(
        datePart.getFullYear(),
        datePart.getMonth(),
        datePart.getDate(),
        hours,
        minutes,
        seconds
    );
 
    return isNaN(combined.getTime()) ? null : combined;
}