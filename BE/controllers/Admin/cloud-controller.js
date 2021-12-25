const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/cloud/index',{
        layout:'layouts/admin-layout',
        title:'Cloud'
    });
})


module.exports = router;