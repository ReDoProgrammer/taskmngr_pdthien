const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/local-level/index',{
        layout:'layouts/admin-layout',
        title:'Staff level'
    });
})


module.exports = router;