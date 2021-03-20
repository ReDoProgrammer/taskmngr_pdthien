const router = require('express').Router();


router.get('/job',(req,res)=>{
    res.render('sale/job/index',{
        layout:'sale-layout'
    });
})


module.exports = router;