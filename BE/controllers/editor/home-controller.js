const router = require('express').Router();

router.get('/default',(req,res)=>{  
    res.render('editor/default',{
        layout:'layouts/auth-layout',
        title:'Editor authentication - Bamboo Photo'
    });
})

router.get('/',(req,res)=>{  
    res.render('editor/home/index',{
        layout:'layouts/editor-layout',
        title:'Editor Home page'      
    });
})


module.exports = router;