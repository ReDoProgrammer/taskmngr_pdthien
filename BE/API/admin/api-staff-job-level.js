const router = require('express').Router();
const StaffJobLevel = require('../../models/staff-job-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.get('/',authenticateAdminToken,(req,res)=>{
    let {levelId} = req.query;
    StaffJobLevel
    .find({job_lv:levelId})
    .populate('job_level','name')   
    .exec()
    .then(sjl=>{
        return res.status(200).json({
            msg:`Load staff job levels successfully!`,
            sjl
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not load staff job level with error: ${new Error(err.message)}`
        })
    })
})

router.post('/',authenticateAdminToken,(req,res)=>{
    let {jobLevleId,staffLevelId} = req.body;
    let sjl = new StaffJobLevel({
        job_lv:jobLevleId,
        staff_lv:staffLevelId
    })

    sjl
    .save()
    .then(sj=>{
        return res.status(201).json({
            msg:`Insert staff job level successfully!`,
            sj
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not add staff job level with error: ${new Error(err.message)}`
        })
    })
})




router.delete('/',authenticateAdminToken,(req,res)=>{
    let {sjId} = req.body;
    StaffJobLevel
    .findByIdAndDelete(sjId)
    .exec()
    .then(_=>{
        return res.status(200).json({
            msg:`Staff job level has been deleted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete staff job level with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;