const router = require('express').Router();
const Wage = require('../../models/wage-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");


router.get('/detail',authenticateAdminToken,(req,res)=>{
    let {utId} = req.query;
    Wage.find({})
    .populate('level','name -_id')
    // .populate('skill','name -_id')
    .exec()
    .then(wages =>{
        console.log(wages);

        return res.status(200).json({
            msg:'Load user group wages successfully',
            wages
        })
    })
    .catch(err=>{
        console.log(`Can not load user group wages with error: ${new Error(err.message)}`);
        return res.status(500).json({
            msg:`Can not load user group wages with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;