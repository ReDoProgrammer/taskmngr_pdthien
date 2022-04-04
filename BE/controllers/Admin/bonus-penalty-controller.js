const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/bonus-penalty/index',{
        layout:'layouts/admin-layout',
        title:'Penalty'
    });
})


module.exports = router;