const router = require('express').Router();
const Job = require('../../models/job-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");

router.get('/list',authenticateAccountantToken,(req,res)=>{
    Job
    .find({})
    .populate('customer','firstname lastname')
    .populate('cb','name')   
    .then(jobs=>{
        console.log(jobs);
        return res.status(200).json({
            msg:`Load jobs list successfully!`,
            jobs
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get jobs list with error: ${new Error(err.message)}`
        })
    })
})

router.get('/detail',authenticateAccountantToken,(req,res)=>{

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


module.exports = router;