const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Job = require('../../models/job-model');




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
    .populate({path:'customer',populate:({path:'color',select:'name -_id'})})       
    .populate({path:'customer',populate:({path:'nation',select:'name -_id'})})       
    .populate({path:'customer',populate:({path:'output',select:'name -_id'})})       
    .populate({path:'customer',populate:({path:'size',select:'name -_id'})})      
    .populate({path:'links',populate:({path:'created_by',select:'fullname'})})  
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
    let {jobId,link,remark} = req.body;

   Job
   .findById(jobId)
   .exec()
   .then(async job=>{
        if(!job){
            return res.status(404).json({
                msg:`Job not found!`
            })
        }

        let lnk = new Link({
            job:job._id,
            url:link,
            remark,
            created_by: req.user._id
        });
        await lnk
        .save()
        .then(async l=>{
            job.links.push(l);
            job.status = 1;
            await job.save()
            .then(_=>{
                return res.status(200).json({
                    msg:`The job has been uploaded successfully!`
                })
            })
            .catch(err=>{
                return res.status(500).json({
                    msg:`Can not stored link into job with error: ${new Error(err.message)}`
                })
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not save link with error: ${new Error(err.mesage)}`
            })
        })
   })
   .catch(err=>{
       return res.status(500).json({
           msg:`Can not get job with error: ${new Error(err.message)}`
       })
   })
    
   
})



module.exports = router;

