const router = require('express').Router();
const Job = require('../../models/job-model');
const { authenticateCustomerToken } = require("../../../middlewares/customer-middleware");

router.get('/',authenticateCustomerToken,(req,res)=>{
    let {search,page} = req.query;
    Job
    .find({})
    .sort({status:1})
    .then(jobs=>{
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

module.exports = router;