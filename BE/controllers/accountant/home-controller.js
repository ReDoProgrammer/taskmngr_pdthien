const router = require('express').Router();

router.get('/login',(req,res)=>{  
    res.render('accountant/default',{
        layout:'layouts/auth-layout',
        title:'Accountant authentication - Bamboo Photo'
    });
})

router.get('/',(req,res)=>{  
    res.render('accountant/home/index',{
        layout:'layouts/accountant-layout',
        title:'Home page'      
    });
})


module.exports = router;