const router = require('express').Router();

router.get('/',(req,res)=>{
    res.render('admin/parents-level/index',{
        layout:'layouts/admin-layout',
        title: 'Parents level'
    });
})

module.exports = router;