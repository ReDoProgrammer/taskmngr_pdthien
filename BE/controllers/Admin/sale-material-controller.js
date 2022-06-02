const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/sale-material/index',{
        layout:'layouts/admin-layout',
        title: 'Sale material'
    });
})


module.exports = router;