const router = require('express').Router();
const StaffJobLevel = require('../../models/staff-job-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.get('/', authenticateAdminToken, (req, res) => {
    let { levelId } = req.query;


    StaffJobLevel
        .find({ staff_lv: levelId })
        .populate('job_lv', 'name')
        .exec()
        .then(sjl => {
            return res.status(200).json({
                msg: `Load staff job levels successfully!`,
                sjl
            })
        })
        .catch(err => {
            console.log(`Can not load staff job level with error: ${new Error(err.message)}`);
            return res.status(500).json({
                msg: `Can not load staff job level with error: ${new Error(err.message)}`
            })
        })
})

router.post('/', authenticateAdminToken, (req, res) => {
    let { jobLevelId, staffLevelId } = req.body;
    

    StaffJobLevel.countDocuments({
        job_lv: jobLevelId,
        staff_lv: staffLevelId
    }, (err, count) => {
        if (err) {
            return res.status(500).json({
                msg: `Can not count staff job level with error: ${new Error(err.message)}`
            })
        }

        if (count > 0) {
            return res.status(403).json({
                msg: `This level with staff level already exist in database!`
            })
        }

        let sjl = new StaffJobLevel({
            job_lv: jobLevelId,
            staff_lv: staffLevelId
        })

        sjl
            .save()
            .then(sj => {
                return res.status(201).json({
                    msg: `Insert staff job level successfully!`,
                    sj
                })
            })
            .catch(err => {
                return res.status(500).json({
                    msg: `Can not add staff job level with error: ${new Error(err.message)}`
                })
            })

    })


})




router.delete('/', authenticateAdminToken, (req, res) => {
    let { sjId } = req.body;
    StaffJobLevel
        .findByIdAndDelete(sjId)
        .exec()
        .then(_ => {
            return res.status(200).json({
                msg: `Staff job level has been deleted!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete staff job level with error: ${new Error(err.message)}`
            })
        })
})

module.exports = router;