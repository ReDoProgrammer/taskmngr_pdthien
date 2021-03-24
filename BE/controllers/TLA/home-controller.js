const router = require('express').Router();

router.get('/',(req,res)=>{
    res.render('TLA/home/index',{
        layout:'layouts/tla-layout'
    });
})


module.exports = router;