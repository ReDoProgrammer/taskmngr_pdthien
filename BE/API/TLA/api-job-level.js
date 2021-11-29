const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const JobLevel = require('../../models/job-level-model');


router.get('/',authenticateTLAToken,(req,res)=>{
    JobLevel
    .find({})
    .exec()
    .then(jl=>{
        return res.status(200).json({
            msg:'Load job level list successfully!',
            jl
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:'Load job levels list failed!',
            error: new Error(err.message)
        })
    })
})




module.exports = router;