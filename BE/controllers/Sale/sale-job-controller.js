const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('sale/job/index',{
        layout:'layouts/sale-layout',
        title:'Job Management'
    });
})


module.exports = router;