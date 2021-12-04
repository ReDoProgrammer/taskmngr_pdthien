const router = require("express").Router();
const Task = require("../../models/task-model");
const { authenticateEditorToken } = require("../../../middlewares/editor-middleware");


router.get('/',authenticateEditorToken,(req,res)=>{
    
    Task
    .find({$or:[
        {staff:req.user._id},
        {status:-1}
    ]})
    .populate('level','name -_id')
    .populate('job')
    .exec()
    .then(tasks=>{       
        return res.status(200).json({
            msg:'Load your tasks successfully!',
            tasks
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:'Load your tasks failed',
            error: `${new Error(err.message)}`
        })
    })
})

router.get('/detail',authenticateEditorToken,(req,res)=>{

})

router.put('/',authenticateEditorToken,(req,res)=>{

})



module.exports = router;