const router = require('express').Router();

router.get('/',(req,res)=>{
    res.render('tla/customer/index',{
        layout:'layouts/tla-layout'
    });
})


module.exports = router;