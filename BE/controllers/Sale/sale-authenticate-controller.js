const router = require('express').Router();


router.get('/login',(req,res)=>{
    res.render('sale/auth/login',{
        layout:'layouts/auth-layout',
        title:'Sale authentication - Bamboo Photo'
    });
})


module.exports = router;