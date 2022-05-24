const router = require('express').Router();

router.get('/login',(req,res)=>{  
    res.render('customer/default',{
        layout:'layouts/auth-layout',
        title:'Customer authentication - Bamboo Photo'
    });
})

router.get('/',(req,res)=>{  
    res.render('customer/home/index',{
        layout:'layouts/customer-layout',
        title:'Customer Homepage'      
    });
})


module.exports = router;