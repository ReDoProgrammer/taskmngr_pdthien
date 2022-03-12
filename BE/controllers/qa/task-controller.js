const router = require('express').Router();

router.get('/all',(req,res)=>{
    res.render('qa/task/all',{
        layout:'layouts/qa-layout',
        title:'Tasks list'
    });
})

router.get('/your-tasks',(req,res)=>{
    res.render('qa/task/your-tasks',{
        layout:'layouts/qa-layout',
        title:'Your tasks'
    });
})
module.exports = router;