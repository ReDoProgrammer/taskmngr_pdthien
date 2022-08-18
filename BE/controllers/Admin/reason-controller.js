const router = require('express').Router();

router.get('/',(req,res)=>{
    res.render('admin/reason/index',{
        layout:'layouts/admin-layout',
        title: 'Canceling task reason'
    });
})

module.exports = router;