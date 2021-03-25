const router = require('express').Router();
const { TLAMiddleware } = require("../../../middlewares/tla-middleware");
const Job = require('../../models/job-model');


router.get('/list',(req,res)=>{
    let {page,search} = req.query;
    Job.find({})
    .populate('customer','firstname lastname remark -_id')
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

router.get('/detail',(req,res)=>{
    let {id} = req.query;
    Job.findById(id)
    .populate({path:'customer',populate:({path:'cloud'})})   
    .populate({path:'customer',populate:({path:'color_mode'})})       
    .exec()
    .then(job=>{
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



module.exports = router;