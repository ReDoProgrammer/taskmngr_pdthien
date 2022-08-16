const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/template/index',{
        title:'Job template',
        layout:'layouts/admin-layout'
    });
})


module.exports = router;