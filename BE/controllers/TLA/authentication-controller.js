const router = require('express').Router();


router.get('/login',(req,res)=>{
    console.log('1');
    res.render('TLA/auth/login',{
        layout:'TLA/auth/login'
    });
})


module.exports = router;