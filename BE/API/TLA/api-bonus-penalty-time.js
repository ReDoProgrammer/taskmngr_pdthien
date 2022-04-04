const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const BonusPenaltyLine = require('../../models/bonus-penalty-line-model');



router.get('/all',authenticateTLAToken,(req,res)=>{

})

router.post('/',authenticateTLAToken,(req,res)=>{
    let {task,bpId,employees} = req.body();
    
})


module.exports = router;