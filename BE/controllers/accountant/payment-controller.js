const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('accountant/payment/index',{
        layout:'layouts/accountant-layout',
        title:'Payment'
    });
})


module.exports = router;