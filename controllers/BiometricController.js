const { Op } = require("sequelize");
const crypto = require('crypto');

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


exports.TimeIn = async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'photo is required' })

    const descriptor = JSON.parse(req.body.descriptor || '[]')
    const geo_lat = req.body.geo_lat ? Number(req.body.geo_lat) : null
    const geo_lng = req.body.geo_lng ? Number(req.body.geo_lng) : null

    const camera_id = req.body.camera_id || 'unknown-camera'
    const device_id = req.body.device_id || 'unknown-device'
    const source = req.body.source || 'Web'
    const captured_at = req.body.captured_at ? new Date(req.body.captured_at) : new Date()

    const image_path = `/uploads/logs/${file.filename}`

    // Compute hashes on server (recommended)
    const image_hash = await sha256File(file.path)

    const payloadForHash = {
      descriptor, geo_lat, geo_lng, camera_id, device_id, source,
      captured_at: captured_at.toISOString(),
      image_hash
    }
    const payload_hash = crypto.createHash('sha256').update(JSON.stringify(payloadForHash)).digest('hex')

    // TODO: your existing face matching logic here:
    // const { match, employee, distance, liveness_passed } = await matchFace(descriptor, ...)
    // Example placeholders:
    const match = true
    const employee = { id: 1 } // replace with matched employee
    const distance = 0.33
    const liveness_passed = true

    // Convert distance to score (0..1)
    const recognition_score = Math.max(0, Math.min(1, 1 - Number(distance || 0)))

    const now = new Date();
    // Save log
    await db.EmployeeLog.create({
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
      match,
      employee,
      distance,
      liveness_passed,
      dtr: { date: new Date().toISOString().slice(0,10), time: new Date().toTimeString().slice(0,8) }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
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