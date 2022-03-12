const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Job = require('../../models/job-model');
const Task = require('../../models/task-model');
const {setJobStatus} = require('../common');



router.get('/list',authenticateTLAToken,(req,res)=>{
    let {page,search} = req.query;
    Job.find({})
    .populate('customer','firstname lastname remark')
    .populate('cb')
    .exec()
    .then(jobs=>{
        
        return res.status(200).json({
            msg:'Load joblist successfully!',
            jobs:jobs
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:'Load jobs list failed!',
            error: new Error(err.message)
        })
    })
})

router.get('/detail',authenticateTLAToken,(req,res)=>{

    let {id} = req.query;
    Job.findById(id)
    .populate({path:'customer',populate:({path:'cloud', select:'name -_id'})})   
    .populate({path:'customer',populate:({path:'color_mode',select:'name -_id'})})       
    .populate({path:'customer',populate:({path:'national_style',select:'name -_id'})})       
    .populate({path:'customer',populate:({path:'output',select:'name -_id'})})       
    .populate({path:'customer',populate:({path:'size',select:'name -_id'})})        
    .exec()
    .then(job=>{
        if(!job){
            return res.status(404).json({
                msg:`Job not found!`
            })
        }
        return res.status(200).json({
            msg:'Get job detail successfully!',
            job:job
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:'Get job information failed!',
            error: new Error(err.message)
        })
    })
})

router.put('/submit',authenticateTLAToken,(req,res)=>{
    let {jobId} = req.body;
    console.log(jobId);
    Task
    .countDocuments({
        job: jobId,
        status:{$in:[3,-4]}
    },async (err,count)=>{
        if(err){
            console.log(err);
            return res.status(500).json({
                msg:`Can not check tasks belong to this job with error: ${new Error(err.message)}`
            })
        }
        if(count>0){
            return res.status(403).json({
                msg:`Can not sumbit this job because having tasks have been not submited done!`
            })
        }
       await setJobStatus(jobId,1,req.user._id)
       .then(job=>{
           return res.status(200).json({
               msg:`The job has been submited!`,
               job
           })
       })
       .catch(err=>{
           console.log(err);
           return res.status(err.code).json({
               msg:err.msg
           })
       })
    })


   
})



module.exports = router;

