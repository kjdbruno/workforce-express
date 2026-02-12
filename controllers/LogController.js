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