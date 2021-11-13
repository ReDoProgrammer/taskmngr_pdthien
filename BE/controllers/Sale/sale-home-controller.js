const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('sale/home/index',{
        layout:'layouts/sale-layout',
        title:'Sale Home page'
    });
})


module.exports = router;