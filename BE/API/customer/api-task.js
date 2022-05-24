const router = require('express').Router();
const Task = require('../../models/task-model');
const { authenticateCustomerToken } = require("../../../middlewares/customer-middleware");

router.get('/list-by-job',authenticateCustomerToken,(req,res)=>{
    let {jobId} = req.query;
    Task
    .find({'basic.job':jobId})
    .populate([       
        {
            path: 'basic.level',
            select: 'name'
        }
    ])
    .then(tasks=>{
        return res.status(200).json({
            msg:`Load tasks list by job successfully!`,
            tasks
        })
    })
    .catch(err=>{
        console.log(`Can not load tasks list by job with error: ${new Error(err.message)}`);
        return res.status(500).json({
            msg:`Can not load tasks list by job with error: ${new Error(err.message)}`
        })
    })
    
})

module.exports = router;