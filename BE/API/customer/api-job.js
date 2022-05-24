const router = require('express').Router();
const Job = require('../../models/job-model');
const { authenticateCustomerToken } = require("../../../middlewares/customer-middleware");

router.get('/list',authenticateCustomerToken,(req,res)=>{
    let {search,page} = req.query;
    console.log({search,page})
    Job
    .find({
        customer:req.customer._id
    })
    .populate('cb')
    .sort({status:1})
    .then(jobs=>{
        console.log(jobs)
        return res.status(200).json({
            msg:`Load jobs list successfully!`,
            jobs
        })
    })
    
    .catch(err=>{
        console.log(`Can not load jobs list with error: ${new Error(err.message)}`);
        return res.status(500).json({            
            msg:`Can not load jobs list with error: ${new Error(err.message)}`
        })
    })
})

router.put('/cc',authenticateCustomerToken,async (req,res)=>{
    let {jobId,cc} = req.body;
    let job = await Job.findById(jobId);
    if(!job){
        return res.status(404).json({
            msg:`Job not found!`
        })
    }
    job.cc.push(cc);
    await job.save()
    .then(_=>{
        return res.status(200).json({
            msg:`CC job successfully!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not push CC into job with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;