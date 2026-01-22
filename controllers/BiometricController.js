const { Op } = require("sequelize");
const { Company, EmployeeFace, Employee, Employment, EmployeePhoto, Position, DailyTimeRecord, LeaveType, EmployeeAccount, EmployeeLeaveApplication, ApprovalSetting, Approval } = require('../models');

function euclideanDistance(d1, d2) {
  return Math.sqrt(
    d1.reduce((sum, val, i) => sum + Math.pow(val - d2[i], 2), 0)
  );
}

exports.ScanBiometric = async (req, res) => {
    try {
        const { descriptor } = req.body;

        const faces = await EmployeeFace.findAll();

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

        const employee = await Employee.findOne({
            include: [
                {
                    model: Employment,
                    as: 'employment',
                    include: [
                        {
                            model: Position,
                            as: 'position'
                        }
                    ]
                }
            ],  
            where: {
                id: bestMatch.employee_id
            }
        });

        if (!employee) {
            return res.status(404).json({ match: false, message: 'Employee not found' });
        }

        //save dtr
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

        const dtr = await DailyTimeRecord.create({
            employee_id: employee.id,
            date,
            time
        })

        res.json({
            match: true,
            employee,
            dtr,
            distance: minDistance,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.ScanFace = async (req, res) => {
    try {
        const { descriptor } = req.body;

        const faces = await EmployeeFace.findAll();

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

        const employee = await Employee.findOne({
            include: [
                {
                    model: Employment,
                    as: 'employment',
                    include: [
                        {
                            model: Position,
                            as: 'position'
                        }
                    ]
                },
                {
                    model: EmployeePhoto,
                    as: 'photo'
                }
            ],  
            where: {
                id: bestMatch.employee_id
            }
        });

        res.json({
            match: true,
            employee,
            distance: minDistance,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.GetLeaveType = async (req, res) => {
    try {
        const data = await LeaveType.findAll({
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
        // get employee userid
        const account = await EmployeeAccount.findOne({
            employee_id: employeeid
        });

        // save leave
        const leave = await EmployeeLeaveApplication.create({
            employee_id: employeeid,
            leave_type_id: typeid,
            date_from: datestart,
            date_to: dateend,
            reason,
            status: 'Filed'
        });

        // Fetch approval settings by document type
        const signatories = await ApprovalSetting.findAll({
            where: {
                owner_id: account.user_id,
                type: 'Leave',
                is_active: true
            },
            order: [['order', 'ASC']]
        });

        for (const sig of signatories) {

            const isFirstApprover = sig.order === 1;

            await Approval.create({
                setting_id: sig.id,
                document_id: leave.id,
                status: isFirstApprover ? 'Approved' : 'Pending',
                signed_at: isFirstApprover ? new Date() : null,
                remarks: isFirstApprover ? 'Auto-approved (owner is first approver)' : null,
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