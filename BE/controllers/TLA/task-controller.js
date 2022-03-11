const router = require('express').Router();

router.get('/',(req,res)=>{
    res.render('TLA/task/index',{
        layout:'layouts/tla-layout',
        title:'Task index'
    });
})


module.exports = router;