const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const CC = require('../../models/cc-model');
const Job= require('../../models/job-model');

router.get('/detail',authenticateTLAToken,async (req,res)=>{
    let {ccId} = req.query;
    let cc = await CC.findById(ccId);
    if(!cc){
        return res.status(404).json({
            msg:`CC not found!`
        })
    }
    return res.status(200).json({
        msg:`Get CC detail successfully!`,
        cc
    })
})
router.get('/list',authenticateTLAToken,async (req,res)=>{
    let { jobId } = req.query;
    let job = await Job.findById(jobId);
    if(!job){
        return res.status(404).json({
            msg:`Can not list CC list belong to not found job!`
        })
    }

    let ccs = await CC.find({_id:{$in:job.cc}})
    .populate('root');

    return res.status(200).json({
        msg:`Load CC list belong to job successfully!`,
        ccs
    })
})



module.exports = router;