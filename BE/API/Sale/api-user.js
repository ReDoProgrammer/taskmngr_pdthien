const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const User = require('../../models/user-model');

router.get('/',authenticateSaleToken,async (req,res)=>{
    let captureders = await User.find({is_active:true}).select('fullname username');
    return res.status(200).json({
        msg:`Load captureders list successfully!`,
        captureders
    })
})

module.exports = router;