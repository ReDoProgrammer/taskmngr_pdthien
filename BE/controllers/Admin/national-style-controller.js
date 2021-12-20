const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/national-style/index',{
        layout:'layouts/admin-layout',
        title: 'National style'
    });
})


module.exports = router;