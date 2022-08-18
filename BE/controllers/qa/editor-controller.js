const router = require('express').Router();

router.get('/',(req,res)=>{
    res.render('qa/editor/index',{
        layout:'layouts/qa-layout',
        title:'Editor zone'
    });
})
module.exports = router;