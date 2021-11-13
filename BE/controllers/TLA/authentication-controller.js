const router = require('express').Router();


router.get('/login',(req,res)=>{
    res.render('TLA/auth/login',{
        layout:'layouts/auth-layout',
        title:'TLA authentication - BamBooPhoto'
    });
})


module.exports = router;