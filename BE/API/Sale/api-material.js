const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Material = require('../../models/material-model');

router.get('/',authenticateSaleToken,async (req,res)=>{
    let materials = await Material.find({});
    return res.status(200).json({
        msg:`Load materials list successfully!`,
        materials
    })
})

module.exports = router;