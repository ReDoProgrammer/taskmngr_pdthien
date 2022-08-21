const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const CC = require('../../models/cc-model');
const Job = require('../../models/job-model');
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
            { path: 'children.task', select: 'basic.level.name' }
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

router.post('/',authenticateSaleToken,async (req,res)=>{
    let {jobId,
        fee,
        special_task,
        root,
        remark} = req.body;

    let cc = new CC();
    cc.job = jobId;
    cc.fee = fee;
    if(special_task == 'true'){
        cc.root = root;
    }
    cc.remark = remark;

    cc.created = {
        at: new Date(),
        by:req.user._id
    };

    await cc.save()
    .then(_=>{
        PushCCIntoJob(jobId,cc._id)
        .then(_=>{
            return res.status(201).json({
                msg:`The CC has been created!`
            })
        })
        .catch(err=>{
            return res.status(err.code).json({
                msg:err.msg
            })
        })
      
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create CC with caught error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;

const PushCCIntoJob = (jobId,ccId)=>{
    return new Promise(async (resolve,reject)=>{
        let job = await Job.findById(jobId);
        if(!job){
            return reject({
                code:404,
                msg:`Can not push CC into job cause job not found!`
            })
        }

        if(job.cc.includes(ccId)){
            return resolve();
        }else{
            job.cc.push(ccId);
            await job.save()
            .then(_=>{return resolve()})
            .catch(err=>{
                return reject({
                    code:500,
                    msg:`Can not push CC into job with caught error: ${new Error(err.message)}`
                })
            })
        }
    })
}