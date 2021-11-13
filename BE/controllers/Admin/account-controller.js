const router = require('express').Router();


router.get('/login',(req,res)=>{
    res.render('admin/auth/login',{
        layout:'layouts/auth-layout',
        title:'Admin authentication - BamBooPhoto'
    });
})


module.exports = router;