const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Template = require('../../models/template-model');

router.get('/',authenticateSaleToken,async (req,res)=>{
    
})

module.exports = router;