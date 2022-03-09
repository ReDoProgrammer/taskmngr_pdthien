const router = require('express').Router();


router.get('/job-finished',(req,res)=>{  
    res.render('accountant/statistic/index',{
        layout:'layouts/accountant-layout',
        title:'Job finished Homepage'      
    });
})


module.exports = router;