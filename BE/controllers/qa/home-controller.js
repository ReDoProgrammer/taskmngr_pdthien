const router = require('express').Router();

router.get('/login',(req,res)=>{  
    res.render('qa/default',{
        layout:'layouts/auth-layout',
        title:'Q.A authentication - Bamboo Photo'
    });
})

router.get('/',(req,res)=>{  
    res.render('qa/home/index',{
        layout:'layouts/qa-layout',
        title:'Home page'      
    });
})


module.exports = router;