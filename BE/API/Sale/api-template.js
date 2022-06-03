const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Template = require('../../models/template-model');

router.get('/',authenticateSaleToken,async (req,res)=>{
    let templates = await Template.find({});
    return res.status(200).json({
        msg:`Load templates list successfully!`,
        templates
    })
})

module.exports = router;