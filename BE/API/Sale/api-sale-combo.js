const router = require('express').Router();
const Combo = require('../../models/combo-model');
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");

router.get('/',authenticateSaleToken,(req,res)=>{
    Combo
    .find({})
    .exec()
    .then(cbs=>{
        return res.status(200).json({
            msg:`Load comboes list successfully!`,
            cbs
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get comboes list with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;