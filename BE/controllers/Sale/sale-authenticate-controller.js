const router = require('express').Router();


router.get('/login',(req,res)=>{
    res.render('sale/auth/login',{
        layout:'sale/auth/login'
    });
})


module.exports = router;