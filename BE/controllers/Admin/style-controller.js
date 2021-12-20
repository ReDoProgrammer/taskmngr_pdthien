const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/style/index',{
        title:'National style',
        layout:'layouts/admin-layout'
    });
})


module.exports = router;