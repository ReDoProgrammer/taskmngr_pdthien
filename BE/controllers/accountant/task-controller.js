const router = require('express').Router();

router.get('/',(req,res)=>{  
    res.render('accountant/task/index',{
        layout:'layouts/accountant-layout',
        title:'Tasks list'      
    });
})


module.exports = router;