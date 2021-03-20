const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('sale/job/index',{
        layout:'layouts/sale-layout'
    });
})


module.exports = router;