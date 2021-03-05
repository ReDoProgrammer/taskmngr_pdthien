const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/size/index',{
        layout:'layouts/admin-layout'
    });
})


module.exports = router;