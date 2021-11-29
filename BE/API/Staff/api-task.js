const router = require("express").Router();
const Task = require("../../models/task-model");
const { authenticateStaffToken } = require("../../../middlewares/staff-middleware");


router.get('/',authenticateStaffToken,(req,res)=>{
    
    Task
    .find({staff:req.user._id})
    .populate('job','name -_id')
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

router.get('/detail',authenticateStaffToken,(req,res)=>{

})

router.put('/',authenticateStaffToken,(req,res)=>{

})



module.exports = router;