const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/file-format/index',{
        layout:'layouts/admin-layout',
        title:'File format'
    });
})


module.exports = router;