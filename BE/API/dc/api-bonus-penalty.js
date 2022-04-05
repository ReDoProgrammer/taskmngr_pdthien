const router = require("express").Router();
const BonusPenalty = require('../../models/bonus-penalty-model');
const { authenticateDCToken } = require("../../../middlewares/dc-middleware");

router.get('/list',authenticateDCToken,(req,res)=>{
    let {is_bonus} = req.query;
    BonusPenalty
    .find({is_bonus})
    .exec()
    .then(bpList=>{
        return res.status(200).json({
            msg:`Get bonus penalty list successfully!`,
            bpList
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not load bonus penalty list with error: ${new Error(err.message)}`
        })
    })
})


module.exports = router;