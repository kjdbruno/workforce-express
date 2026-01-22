const { Op } = require("sequelize");
const { Overtime, EmployeeOvertimeApplication, ApprovalSetting, Approval, Employee, User, EmployeeAccount, Employment, Position } = require('../models');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment');

const pug = require('pug');
const puppeteer = require('puppeteer');

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

        // const where = {};

        // if (Filter) {
        //     where.description = { [Op.like]: `%${Filter}%` };
        // }

        const { count, rows } = await Overtime.findAndCountAll({
            include: [
                {
                    model: EmployeeOvertimeApplication,
                    as: 'applications'
                }
            ],
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
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

exports.GetEmployee = async (req, res) => {
    try {
        const data = await Employee.findAll();
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};

exports.Create = async (req, res) => {

    const {
        date,
        timeStart,
        timeEnd,
        description,
        employees
    } = req.body;

    try {
        const empList = Array.isArray(employees) ? employees : [];

        // Create overtime header
        const overtime = await Overtime.create({
            date,
            time_start: timeStart,
            time_end: timeEnd,
            description
        });

        // Get existing applications for this overtime (if editing, pass overtime_id)
        const existingRecords = await EmployeeOvertimeApplication.findAll({
            where: {
                overtime_id: overtime.id
            }
        });

        const existingIds = existingRecords.map(e => e.id);
        const sentIds = empList.filter(e => e.id).map(e => e.id);

        for (const emp of empList) {
            if (emp.id && existingIds.includes(emp.id)) {
                // UPDATE existing
                await EmployeeOvertimeApplication.update({
                    employee_id: emp.employeeid
                }, {
                    where: { 
                        id: emp.id 
                    }
                });
            } else {
                // INSERT new
                await EmployeeOvertimeApplication.create({
                    overtime_id: overtime.id,
                    employee_id: emp.employeeid
                });
            }
        }

        // Deactivate removed employees
        const toDeactivate = existingIds.filter(oldId => !sentIds.includes(oldId));
        if (toDeactivate.length > 0) {
            await EmployeeOvertimeApplication.update({
                    status: 'Cancelled' 
                },
                { where: {
                    id: toDeactivate 
                }
            });
        }

        // Fetch approval settings by document type
        const signatories = await ApprovalSetting.findAll({
            where: {
                owner_id: req.user.id,
                type: 'Overtime',
                is_active: true
            },
            order: [['order', 'ASC']]
        });

        for (const sig of signatories) {

            const isFirstApprover = sig.order === 1;

            await Approval.create({
                setting_id: sig.id,
                document_id: overtime.id,
                status: isFirstApprover ? 'Approved' : 'Pending',
                signed_at: isFirstApprover ? new Date() : null,
                remarks: isFirstApprover ? 'Auto-approved (owner is first approver)' : null,
                is_active: true
            });
        }

        res.status(201).json({
            message: 'Record Saved!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to save overtime record', error });
    }

};

exports.GetDetails = async (req, res) => {

    const { id } = req.params;

    try {
        
        const overtime = await Overtime.findOne({
            include: [
                {
                    model: EmployeeOvertimeApplication,
                    as: 'applications'
                }
            ],
            where: { 
                id 
            }
        });

        const approvals = await Approval.findAll({
            where: { document_id: overtime.id, is_active: true },
            include: [
                {
                    model: ApprovalSetting,
                    as: 'setting',
                    where: {
                        type: 'Overtime'
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

        // 3️⃣ Combine vacancy + approvals
        const result = {
            ...overtime.toJSON(),
            approvals
        };

        res.json({ result });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};