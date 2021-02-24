const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/customer-style/index',{
        layout:'layouts/backend-layout'
    });
})


module.exports = router;