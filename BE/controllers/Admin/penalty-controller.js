const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/penalty/index',{
        layout:'layouts/admin-layout',
        title:'Penalty'
    });
})


module.exports = router;