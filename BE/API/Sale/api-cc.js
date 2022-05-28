const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const CC = require('../../models/cc-model');
const Job = require('../../models/job-model');
router.post('/',authenticateSaleToken,async (req,res)=>{
    let {jobId,ccType,remark} = req.body;
    let cc = new CC();
    cc.job = jobId;
    cc.type = ccType;
    cc.remark = remark;
    cc.created.by = req.user._id;

    await cc.save()
    then(_=>{
        return res.status(201).json({
            msg:`new CC has been created!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create cc with error: ${new Error(err.message)}`
        })
    })
})

router.put('/',authenticateSaleToken,async (req,res)=>{
    let {ccId,remark,ccType} = req.body;
    let cc = await CC.findById(ccId);
    if(!cc){
        return res.status(404).json({
            msg:`CC not found!`
        })
    }

    cc.remark = remark;
    cc.type = ccType;
    cc.updated.by = req.user._id;
    cc.updated.at  = new Date();
    await cc.save()
    .then(_=>{
        return res.status(200).json({
            msg:`CC has been updated!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not update CC with error: ${new Error(err.message)}`
        })
    })

})

router.delete('/',authenticateSaleToken,(req,res)=>{
    let {ccId} = req.body;
    CC.findByIdAndDelete(ccId)
    .then(async cc=>{
        if(!cc){
            return res.status(404).json({
                msg:`CC not found`
            });
        }
        let job = await Job.findById(cc.job);
        if(!job){
            return res.status(404).json({
                msg:`Job not found!`
            })
        }

        job.cc.pull(ccId);
        await job.save()
        .then(_=>{
            return res.status(200).json({
                msg:`CC has been removed!`
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not remove CC from job with error: ${new Error(err.message)}`
            })
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete CC with error: ${new Error(err.message)}`
        })
    })
})

router.get('/',authenticateSaleToken,async (req,res)=>{
    let {jobId} = req.query;
    await CC.find({job:jobId})
    .populate('created.by','fullname')
    .populate('update.by','fullname')
    .exec()    
    .then(ccList=>{
        return res.status(200).json({
            msg:'Load CC list by job successfully!',
            ccList
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not load CC list by job with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;