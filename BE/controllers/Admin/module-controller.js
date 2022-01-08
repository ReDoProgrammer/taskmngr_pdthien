const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/module/index',{
        layout:'layouts/admin-layout',
        title: 'Module'
    });
})


module.exports = router;