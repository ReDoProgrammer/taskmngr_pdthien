const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/combo/index',{
        layout:'layouts/admin-layout',
        title:'Combo'
    });
})


module.exports = router;