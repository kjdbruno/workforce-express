const { Op } = require("sequelize");
const os = require("os");

const moment = require('moment');
const db = require('../models');
const { sequelize } = db;

let io;

module.exports = (_io) => {
    io = _io;

    return {
        CreateVacancy: async (req, res) => {

            const { 
                positionId,
                shiftId,
                date,
                location,
                movement,
                justification,
                needBackgroundCheck,
                employmentStatus
            } = req.body;

            const transaction = await sequelize.transaction();

            try {

                const sign = await db.ApprovalSetting.findOne({
                    where: {
                        owner_id: req.user.id,
                        type: 'Vacancy',
                        order: 1,
                        is_active: true
                    },
                    transaction
                });
                if (!sign) {
                    await transaction.rollback();
                    return res.status(400).json({ error: "Approval setting not found for this document type and owner!" });
                }

                const year = new Date().getFullYear().toString();
                const latest = await db.Vacancy.findOne({
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
        
                const vacancy = await db.Vacancy.create({
                    control_no: newNo,
                    position_id: positionId,
                    shift_id: shiftId,
                    date_needed: date,
                    location,
                    movement,
                    justification,
                    need_background_check: needBackgroundCheck,
                    employment_status: employmentStatus,
                    status: 'Requested'
                }, { transaction });
        
                await db.Position.update(
                    { status: 'Requested' },
                    { where: { id: positionId }, transaction }
                );
        
        
                // Fetch approval settings by document type
                const signatories = await db.ApprovalSetting.findAll({
                    where: {
                        owner_id: req.user.id,
                        type: 'Vacancy',
                        is_active: true
                    },
                    order: [['order', 'ASC']]
                });
                for (const sig of signatories) {
                    const isFirstApprover = sig.order === 1;
                    await db.Approval.create({
                        setting_id: sig.id,
                        document_id: vacancy.id,
                        status: isFirstApprover ? 'Approved' : 'Pending',
                        signed_at: isFirstApprover ? new Date() : null,
                        remarks: isFirstApprover ? 'Auto-approved (owner is first approver)' : null,
                        is_active: true
                    }, { transaction });

                    /**
                     * Notification to approver
                     */
                    if (sig.approver_id !== req.user.id) {
                        await db.Notification.create({
                            sender_id: req.user?.id,
                            receiver_id: sig.approver_id,
                            content: `New vacancy request (${vacancy.control_no}) requires your approval.`,
                            status: 'unread'
                        });   
                    }
                    const notificationCount = await db.Notification.count({
                        where: {
                            receiver_id: sig.approver_id,
                            status: 'unread'
                        }
                    });
                    const notifications = await db.Notification.findAll({
                        where: {
                            status: 'unread',
                            receiver_id: sig.approver_id
                        },
                        order: [
                            ['createdAt', 'DESC'] // 'DESC' for latest first (descending order)
                        ]
                    });
                    io.emit('EmitNotifications', notificationCount, notifications);
                }
        
                await transaction.commit();
        
                res.status(201).json({
                    message: "Record Saved!"
                });
                
            } catch (error) {
                console.error("Error creating vacancy:", error);
                await transaction.rollback();
                res.status(400).json({ 
                    error: error.message 
                });
            }
        },
        CreateVacancyApproval: async (req, res) => {

            const id = parseInt(req.params.id, 10);
            const approvalid = parseInt(req.body.approvalid, 10);

            const transaction = await sequelize.transaction();

            try {

                if (!id || !approvalid) {
                    await transaction.rollback();
                    return res.status(400).json({ error: "Missing required id / approvalid." });
                }
        
                // 1️ Fetch vacancy (inside transaction)
                const vacancy = await db.Vacancy.findByPk(id, { transaction });
        
                if (!vacancy) {
                    await transaction.rollback();
                    return res.status(404).json({
                        errors: [
                            {
                                type: "field",
                                value: id,
                                msg: "Record not found!",
                                path: "id",
                                location: "body",
                            },
                        ],
                    });
                }
        
                // 2️ Fetch approval (must belong to this document)
                const approval = await db.Approval.findOne({
                    where: {
                        id: approvalid,
                        document_id: id,
                        is_active: true,
                    },
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });
        
                if (!approval) {
                    await transaction.rollback();
                    return res.status(404).json({ error: "Approval record not found for this document!" });
                }
        
                // if already approved, just return OK (idempotent)
                if (approval.status !== "Approved") {
                    await approval.update(
                        { status: "Approved", signed_at: new Date() }, // remove signed_at if you don't have it
                        { transaction }
                    );
                }
        
                const totalCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'Vacancy'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true
                    },
                    transaction
                });
        
                const approvedCount = await db.Approval.count({
                    include: [
                        {
                            model: db.ApprovalSetting,
                            as: 'setting',
                            where: {
                                type: 'Vacancy'
                            }
                        }
                    ],
                    where: {
                        document_id: id,
                        is_active: true,
                        status: 'Approved'
                    },
                    transaction
                });
        
                // 4️ If all approvals done, approve vacancy + approve position
                if (totalCount === approvedCount) {
                    await vacancy.update({ status: "Approved" }, { transaction });
        
                    await db.Position.update(
                        { status: "Approved" },
                        { where: { id: vacancy.position_id }, transaction }
                    );
                }

                // 5 send notification to  hr and the requestor that the vacancy is approved
                

                await transaction.commit();

                return res.status(200).json({
                    message: "Record Saved!"
                });
                
            } catch (error) {
                console.error("Error creating vacancy:", error);
                await transaction.rollback();
                res.status(400).json({ 
                    error: error.message 
                });
            }
        },
    };
};
