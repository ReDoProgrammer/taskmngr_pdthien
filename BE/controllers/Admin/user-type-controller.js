const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/user-type/index',{
        layout:'layouts/admin-layout'
    });
})


module.exports = router;