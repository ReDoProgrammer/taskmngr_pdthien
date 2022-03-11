const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const CustomerLevel = require('../../models/customer-level-model');


router.get('/',authenticateTLAToken,(req,res)=>{    

    let {customerId} = req.query;  

    CustomerLevel
    .find({})
    .exec()
    .then(levels=>{
        return res.status(200).json({
            msg:'Load levels list successfully!',
            levels
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:'Load levels list failed!',
            error: new Error(err.message)
        })
    })
})




module.exports = router;