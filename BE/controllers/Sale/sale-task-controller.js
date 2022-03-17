const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('sale/task/index',{
        layout:'layouts/sale-layout',
        title:'Task list'
    });
})


module.exports = router;