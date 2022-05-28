const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const CC = require('../../models/cc-model');
router.get('/',authenticateSaleToken,(req,res)=>{
    
})

module.exports = router;