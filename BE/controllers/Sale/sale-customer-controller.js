const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('sale/customer/index',{
        layout:'layouts/sale-layout',
        title:'Sale Customer'
    });
})


module.exports = router;