const router = require('express').Router();
const Job = require('../../models/job-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");

router.get('/list',authenticateAccountantToken,(req,res)=>{
    Job
    .find({})
    .then(jobs=>{
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


module.exports = router;