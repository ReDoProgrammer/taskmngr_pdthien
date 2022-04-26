const router = require('express').Router();

router.get('/',(req,res)=>{
    res.render('tla/checkin/index',{
        layout:'layouts/tla-layout',
        title:'Staff checkin'
    });
})


module.exports = router;