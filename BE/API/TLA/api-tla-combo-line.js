const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const ComboLine = require('../../models/combo-line-model');

router.get('/',authenticateTLAToken,(req,res)=>{
    let {cb} = req.query;
    ComboLine
    .find({cb})
    .populate('lv','name')
    .exec()
    .then(cbls=>{
        return res.status(200).json({
            msg:`Load combolines by combo id successfully!`,
            cbls
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not list combolines by combo id with error: ${new Error(err.message)}`
        })
    })
})


module.exports = router;