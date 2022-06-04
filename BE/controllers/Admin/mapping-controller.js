const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/mapping/index',{
        layout:'layouts/admin-layout',
        title:'Mapping job level'
    });
})


module.exports = router;