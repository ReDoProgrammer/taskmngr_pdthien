const router = require('express').Router();
const CustomerLevel = require('../../models/customer-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");


router.get('/',authenticateAdminToken,(req,res)=>{
    let {customerId} = req.query;
    CustomerLevel
    .find({customer:customerId})
    .populate('level')
    .exec()
    .then(cl=>{
        console.log(cl);
        return res.status(200).json({
            msg:'Load customer levels successfully',
            cl
        })
    })
    .catch(err=>{
        console.log(`error found when loading customer levels: ${new Error(err.message)}`);
        return res.status(500).json({
            msg:`Can not load customer levels with error: ${new Error(err.message)}`
        })
    })

})


module.exports = router;