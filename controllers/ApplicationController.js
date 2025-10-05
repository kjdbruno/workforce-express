const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { Profile, Application, ProfileEducation, ProfileTraining, ProfileExperience, ProfileDocument, SchoolLevel, School, Course } = require('../models');

exports.GetAll = async (req, res) => {
    const vacancyId = req.query.id;
    try {

        const rows = await Application.findAll({
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    include: [
                        {
                            model: ProfileEducation,
                            as: 'educations',
                            attributes: [
                                'startDate', 'endDate', 'rating', 'graduated'
                            ],
                            include: [
                                {
                                    model: SchoolLevel,
                                    as: 'level',
                                    attributes: [
                                        "name"
                                    ]
                                },
                                {
                                    model: School,
                                    as: 'school',
                                    attributes: [
                                        'name', 'type', 'website', 'contactNo'
                                    ]
                                },
                                {
                                    model: Course,
                                    as: 'course',
                                    attributes: [
                                        'name'
                                    ]
                                }
                            ]
                        },
                        {
                            model: ProfileTraining,
                            as: 'trainings',
                            attributes: [
                                'title', 'startDate', 'endDate', 'hour', 'type', 'conductedBy'
                            ]
                        },
                        {
                            model: ProfileExperience,
                            as: 'experiences',
                            attributes: [
                                'position', 'jobDescription', 'startDate', 'endDate'
                            ]
                        }
                    ]
                }
            ],
            where: {
                vacancyId
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            data: rows
        });

    } catch (error) {

        res.status(500).json({ 
            error: error.message 
        });

    }
};

exports.Create = async (req, res) => {
    const {
    vacancyId,
    firstname,
    middlename,
    lastname,
    suffix,
    sexId,
    maritalId,
    birthdate,
    birthplace,
    weight,
    height,
    bloodTypeId,
    email,
    contactNo,
    regionId,
    provinceId,
    townId,
    barangayId,
    streetAddress,
    educations,
    trainings,
    experiences
  } = req.body;

  const files = req.files || [];
  
  const educ = JSON.parse(educations || "[]");
  const train = JSON.parse(trainings || "[]");
  const exp = JSON.parse(experiences || "[]");
  
  const t = await Profile.sequelize.transaction();

  try {
    
    const profile = await Profile.create({
        firstname,
        middlename,
        lastname,
        suffix,
        sexId,
        civilStatusId: maritalId,
        birthdate,
        birthplace,
        regionId,
        provinceId,
        townId,
        barangayId,
        streetAddress,
        weight,
        height,
        bloodTypeId,
        email,
        contactNo
    }, { transaction: t });
    
    await Application.create({
        profileId: profile.id,
        vacancyId
    }, { transaction: t });
    
    for (const edu of educ) {
        await ProfileEducation.create({
            profileId: profile.id,
            levelId: edu.levelId,
            schoolId: edu.schoolId,
            courseId: edu.courseId,
            rating: edu.rating,
            startDate: edu.startDate,
            endDate: edu.endDate,
            graduated: edu.yearGraduated
        }, { transaction: t });
    }
    
    for (const tr of train) {
        await ProfileTraining.create({
            profileId: profile.id,
            title: tr.title,
            type: tr.type,
            startDate: tr.startDate,
            endDate: tr.endDate,
            hour: tr.hour,
            conductedBy: tr.conductedBy,
        }, { transaction: t });
    }
    
    for (const ex of exp) {
        await ProfileExperience.create({
            profileId: profile.id,
            position: ex.position,
            startDate: ex.startDate,
            endDate: ex.endDate,
            jobDescription: ex.description
        }, { transaction: t });
    }
    
    for (const file of files) {
        const filePath = `/uploads/${file.filename}`;
        await ProfileDocument.create({
            profileId: profile.id,
            file: filePath,
            filename: file.originalname
        }, { transaction: t });
    }


    await t.commit();

    res.status(201).json({
        message: "Record Saved!"
    });

    } catch (error) {
        await t.rollback();
        res.status(400).json({
            error: error.message
        });
    }
};


exports.Update = async (req, res) => {

    // const { 
    //     id 
    // } = req.params;

    // const { 
    //     name
    // } = req.body;

    // try {

    //     const sex = await Sex.findByPk(id);
        
    //     if (!sex) {
    //         return res.status(500).json({
    //             errors: [{
    //                 type: "field",
    //                 value: name,
    //                 msg: "Record not found!",
    //                 path: "name",
    //                 location: "body",
    //             }],
    //         });
    //     }

    //     const exist = await Sex.findOne({
    //         where: {
    //             [Op.or]: [{ name }],
    //             id: { [Op.ne]: id }
    //         },
    //     });
    //     if (exist) {
    //         return res.status(500).json({
    //             errors: [{
    //                 type: "field",
    //                 value: name,
    //                 msg: "Record already in use!",
    //                 path: "name",
    //                 location: "body",
    //             }],
    //         });
    //     }

    //     await sex.update({ 
    //         name
    //     });

    //     res.status(201).json({
    //         message: "Record Modified!", 
    //         sex: sex
    //     });

    // } catch (error) {

    //     res.status(400).json({ 
    //         error: error.message 
    //     });

    // }
};

exports.Disable = async (req, res) => {

    // const { 
    //     id 
    // } = req.params;
  
    // try {

    //     const sex = await Sex.findByPk(id);

    //     if (!sex) {
    //         return res.status(500).json({
    //             errors: [{
    //                 type: "field",
    //                 value: id,
    //                 msg: "Record not found!",
    //                 path: "name",
    //                 location: "body",
    //             }],
    //         });
    //     }

    //     await sex.update({ 
    //         isActive: false
    //     });

    //     res.status(200).json({
    //         message: "Record Disabled!", 
    //         sex: sex 
    //     });

    // } catch (error) {

    //     res.status(500).json({ 
    //         error: error.message 
    //     });

    // }
};

exports.Enable = async (req, res) => {

    // const { 
    //     id 
    // } = req.params;
  
    // try {

    //     const sex = await Sex.findByPk(id);

    //     if (!sex) {
    //         return res.status(500).json({
    //             errors: [{
    //                 type: "field",
    //                 value: id,
    //                 msg: "Record not found!",
    //                 path: "name",
    //                 location: "body",
    //             }],
    //         });
    //     }

    //     await sex.update({ 
    //         isActive: true 
    //     });

    //     res.status(200).json({
    //         message: "Record Enabled!.", 
    //         sex: sex
    //     });
    // } catch (error) {

    //     res.status(500).json({ 
    //         error: error.message 
    //     });

    // }
};