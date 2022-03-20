const router = require('express').Router();
const Task = require('../../models/task-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");

router.get('/list-by-job',authenticateAccountantToken,(req,res)=>{
    let {jobId} = req.query;
    Task
    .find({job:jobId})
    .then(tasks=>{
        return res.status(200).json({
            msg:`Load tasks list by job id successfully!`,
            tasks
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get tasks list by job id with error: ${new Error(err.message)}`
        })
    })
})


module.exports = router;