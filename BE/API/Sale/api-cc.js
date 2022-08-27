const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const CC = require('../../models/cc-model');
const Job = require('../../models/job-model');
const Task = require('../../models/task-model');
const { ValidateCheckIn } = require('../../../middlewares/checkin-middleware');
router.get('/', authenticateSaleToken, async (req, res) => {
    let ccs = await CC.find({})
        .populate([
            { path: 'job' },
            { path: 'root', select: 'name' },
            { path: 'children.task', select: 'basic.level.name' }
        ]);
    return res.status(200).json({
        msg: `Load CC list successfully!`,
        ccs
    })
})

router.get('/list-by-job', authenticateSaleToken, async (req, res) => {
    let { jobId } = req.query;
    let ccs = await CC.find({ job: jobId })
        .populate([
            { path: 'job' },
            { path: 'root', select: 'name' },
            {
                path: 'children.task',
                populate: ({
                    path: 'basic.level',
                    select: 'name'
                })
            }
        ]);

    return res.status(200).json({
        msg: `Load CC list by job successfully!`,
        ccs
    })
})

router.get('/detail', authenticateSaleToken, async (req, res) => {
    let { ccId } = req.query;
    let cc = await CC.findById(ccId)
        .populate([
            { path: 'job' },
            { path: 'root', select: 'name' },
            { path: 'children.task', select: 'basic.level.name' }
        ]);
    return res.status(200).json({
        msg: `Get CC detail successfully!`,
        cc
    })
})

router.put('/', [authenticateSaleToken, ValidateCheckIn], async (req, res) => {
    let { ccId,
        fee,
        root,
        task,
        remark } = req.body;
    let cc = await CC.findById(ccId);
    if (!cc) {
        return res.status(404).json({
            msg: `Can not update a not found CC!`
        })
    }

    cc.fee = fee;
    console.log(root)
    if (root) {
        cc.root = root;
        cc.children = [{ task }];
    }else{
        cc.root = null;
        cc.children = [];
    }

    cc.remark = remark;
    cc.updated = {
        at: new Date(),
        by: req.user._id
    };

    await cc.save()
        .then(_ => {
            return res.status(200).json({
                msg: `The CC has been updated!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not update CC with caught error: ${new Error(err.message)}`
            })
        })
})

router.post('/', [authenticateSaleToken, ValidateCheckIn], async (req, res) => {
    let { jobId,
        fee,
        root,
        task,
        remark } = req.body;


    let cc = new CC();
    cc.job = jobId;
    cc.fee = fee;
    if (root) {
        cc.root = root;
        cc.children = [{ task }];
    }
    cc.remark = remark;

    cc.created = {
        at: new Date(),
        by: req.user._id
    };

    await cc.save()
        .then(_ => {
            PushCCIntoJob(jobId, cc._id)
                .then(_ => {
                    return res.status(201).json({
                        msg: `The CC has been created!`
                    })
                })
                .catch(err => {
                    return res.status(err.code).json({
                        msg: err.msg
                    })
                })

        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not create CC with caught error: ${new Error(err.message)}`
            })
        })
})

router.delete('/', [authenticateSaleToken, ValidateCheckIn], async (req, res) => {
    let { jobId, ccId } = req.body;
    let cc = await CC.findById(ccId);
    if (!cc) {
        return res.status(404).json({
            msg: `Can not delete not found CC!`
        })
    }
    let count = await Task.countDocuments({
        _id:{$in:cc.children},
        status:{$gte:1}
    })
    if(count>0){
        return res.status(403).json({
            msg:`Can not delete this CC since Editor submited task!`
        })
    }
    await cc.delete()
        .then(_ => {
            PullCCFromJob(jobId, ccId)
                .then(_ => {
                    return res.status(200).json({
                        msg: `CC has been removed!`
                    })
                })
                .catch(err => {
                    return res.status(err.code).json({
                        msg: err.msg
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this CC with caught error: ${new Error(err.message)}`
            })
        })
})

module.exports = router;


const PullCCFromJob = (jobId, ccId) => {
    return new Promise(async (resolve, reject) => {
        let job = await Job.findById(jobId);
        if (!job) {
            return reject({
                code: 404,
                msg: `Can not pull CC from job cause job not found!`
            })
        }

        if (!job.cc.includes(ccId)) {
            return reject({
                code: 404,
                msg: `CC not exists in this job!`
            })
        }
        job.cc = job.cc.filter(x => x != ccId);
        await job.save()
            .then(_ => { return resolve() })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not remove this cc out of job with caught error: ${new Error(err.message)}`
                })
            })
    })
}

const PushCCIntoJob = (jobId, ccId) => {
    return new Promise(async (resolve, reject) => {
        let job = await Job.findById(jobId);
        if (!job) {
            return reject({
                code: 404,
                msg: `Can not push CC into job cause job not found!`
            })
        }

        if (job.cc.includes(ccId)) {
            return resolve();
        } else {
            job.cc.push(ccId);
            await job.save()
                .then(_ => { return resolve() })
                .catch(err => {
                    return reject({
                        code: 500,
                        msg: `Can not push CC into job with caught error: ${new Error(err.message)}`
                    })
                })
        }
    })
}

