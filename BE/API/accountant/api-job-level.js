const router = require('express').Router();
const JobLevel = require('../../models/job-level-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");



/*
    api này dùng để quản trị các joblevel ( loại mặt hàng của khác)
*/

router.get('/',authenticateAccountantToken,(req,res)=>{
    JobLevel
    .find({})
    .exec()
    .then(jl=>{        
        return res.status(200).json({
            msg:`Load job levels list successfully!!`,
            jl
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not load job levels list with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;