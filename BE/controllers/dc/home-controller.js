const router = require('express').Router();

router.get('/login',(req,res)=>{  
    res.render('dc/default',{
        layout:'layouts/auth-layout',
        title:'DC authentication - Bamboo Photo'
    });
})

router.get('/',(req,res)=>{  
    res.render('dc/home/index',{
        layout:'layouts/dc-layout',
        title:'DC Home page'      
    });
})


module.exports = router;