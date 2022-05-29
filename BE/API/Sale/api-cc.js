const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const CC = require('../../models/cc-model');
const Job = require('../../models/job-model');
const Task = require('../../models/task-model');
router.post('/', authenticateSaleToken, async (req, res) => {
    let { jobId, ccType, remark, taskId } = req.body;

    let cc = new CC();
    cc.job = jobId;
    cc.type = ccType;
    cc.remark = remark;
    cc.created.by = req.user._id;

    let job = await Job.findById(jobId);
    if (!job) {
        return res.status(404).json({
            msg: `Job not found!`
        })
    }

    if (taskId.length > 0) {
        cc.fixible_task=taskId;
    }
    let task = taskId.length > 0 ? await Task.findById(taskId) : null;

    if (taskId.length > 0 && !task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    await cc.save()
        .then(async _ => {
            job.cc.push(cc);
            await job.save()
                .then(async _ => {
                    if (task) {
                        task.fixible_task = cc;
                        await task.save()
                            .then(_ => {
                                return res.status(201).json({
                                    msg: `new CC has been created!`
                                })
                            })
                            .catch(err => {
                                console.log(`Can not set cc into task with error: ${new Error(err.message)}`)
                                return res.status(500).json({
                                    msg: `Can not set cc into task with error: ${new Error(err.message)}`
                                })
                            })
                    } else {
                        return res.status(201).json({
                            msg: `new CC has been created!`
                        })
                    }
                })
                .catch(err => {
                    console.log(`Can not push cc into job with error: ${new Error(err.message)}`)
                    return res.status(500).json({
                        msg: `Can not push cc into job with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            console.log(`Can not create cc with error: ${new Error(err.message)}`)
            return res.status(500).json({
                msg: `Can not create cc with error: ${new Error(err.message)}`
            })
        })
})

router.put('/', authenticateSaleToken, async (req, res) => {
    let { ccId, remark, ccType, taskId } = req.body;
    let cc = await CC.findById(ccId);
    if (!cc) {
        return res.status(404).json({
            msg: `CC not found!`
        })
    }

    if (cc.status > 0) {
        return res.status(403).json({
            msg: `Can not update CC after submited by Editor`
        })
    }

    cc.remark = remark;
    cc.type = ccType;
    cc.updated.by = req.user._id;
    cc.updated.at = new Date();
    if (taskId.length > 0) {
        cc.fix_task = taskId;
    }
    await cc.save()
        .then(_ => {
            return res.status(200).json({
                msg: `CC has been updated!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not update CC with error: ${new Error(err.message)}`
            })
        })

})

router.delete('/', authenticateSaleToken, (req, res) => {
    let { ccId } = req.body;
    CC.findByIdAndDelete(ccId)
        .then(async cc => {
            if (!cc) {
                return res.status(404).json({
                    msg: `CC not found`
                });
            }
            let job = await Job.findById(cc.job);
            if (!job) {
                return res.status(404).json({
                    msg: `Job not found!`
                })
            }

            job.cc.pull(ccId);
            await job.save()
                .then(_ => {
                    return res.status(200).json({
                        msg: `CC has been removed!`
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not remove CC from job with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete CC with error: ${new Error(err.message)}`
            })
        })
})

router.get('/', authenticateSaleToken, async (req, res) => {
    let { jobId } = req.query;
    await CC.find({ job: jobId })
        .populate('created.by', 'fullname')
        .populate('update.by', 'fullname')
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

router.get('/detail', authenticateSaleToken, async (req, res) => {
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
    })
})

module.exports = router;