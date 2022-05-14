const router = require('express').Router();

router.get('/',(req,res)=>{
    res.render('TLA/checkin/index',{
        layout:'layouts/tla-layout',
        title:'Staff checkin'
    });
})


module.exports = router;