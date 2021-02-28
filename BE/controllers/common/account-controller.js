const router = require('express').Router();


router.get('/login',(req,res)=>{
    res.render('common/account/login',{
        layout:'common/account/login'
    });
})


module.exports = router;