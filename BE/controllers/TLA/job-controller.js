const router = require('express').Router();

router.get('/',(req,res)=>{
    res.render('TLA/job/index',{
        layout:'layouts/tla-layout',
        title:'Job index'
    });
})


module.exports = router;