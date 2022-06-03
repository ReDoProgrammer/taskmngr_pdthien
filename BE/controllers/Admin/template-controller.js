const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/template/index',{
        title:'Tempalte',
        layout:'layouts/admin-layout'
    });
})


module.exports = router;