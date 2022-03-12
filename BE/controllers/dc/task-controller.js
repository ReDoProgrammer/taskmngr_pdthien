const router = require('express').Router();


router.get('/all',(req,res)=>{  
    res.render('dc/task/index',{
        layout:'layouts/dc-layout',
        title:'Task list'      
    });
})
router.get('/your-tasks',(req,res)=>{  
    res.render('dc/task/your-tasks',{
        layout:'layouts/dc-layout',
        title:'Your tasks'      
    });
})


module.exports = router;