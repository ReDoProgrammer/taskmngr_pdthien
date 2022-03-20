const router = require('express').Router();

router.get('/',(req,res)=>{  
    res.render('accountant/job/index',{
        layout:'layouts/accountant-layout',
        title:'Job list'      
    });
})


module.exports = router;