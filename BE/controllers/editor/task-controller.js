const router = require('express').Router();

router.get('/all',(req,res)=>{  
    res.render('editor/task/index',{
        layout:'layouts/editor-layout',
        title:'Task list'      
    });
})


module.exports = router;