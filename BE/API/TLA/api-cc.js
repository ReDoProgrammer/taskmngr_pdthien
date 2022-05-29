const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const CC = require('../../models/cc-model');
const Job = require('../../models/job-model');

router.get('/', authenticateTLAToken, async (req, res) => {
    let { jobId } = req.query;
    await CC.find({ job: jobId })
        .populate('created.by', 'fullname')
        .populate('update.by', 'fullname')
        .populate({
            path : 'additional_tasks',
            populate : {
              path : 'basic.level'
            }
          })
        .populate({
            path: 'fixible_task',
            populate: {
                path: 'basic.level'
            }
        })
        .exec()
        .then(ccList => {
            return res.status(200).json({
                msg: 'Load CC list by job successfully!',
                ccList
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load CC list by job with error: ${new Error(err.message)}`
            })
        })
})

router.get('/detail', authenticateTLAToken, async (req, res) => {
    let { ccId } = req.query;
    let cc = await CC.findById(ccId);
    if (!cc) {
        return res.status(404).json({
            msg: `CC not found!`
        })
    }

    return res.status(200).json({
        msg: `Load CC detail successfully!`,
        cc
    });
})




module.exports = router;