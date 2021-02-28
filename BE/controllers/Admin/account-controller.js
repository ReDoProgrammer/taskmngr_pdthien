const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/account/login',{
        layout:'admin/account/login'
    });
})


module.exports = router;