const router = require("express").Router();
const Queue = require('../../models/queue-model');
const { authenticateEditorToken } = require("../../../middlewares/editor-middleware");

router.post('/',authenticateEditorToken,(req,res)=>{

    Queue
    .countDocuments({staff:req.user._id},async (err,count)=>{
        if(err){
            return res.status(500).json({
                msg:`Can not check queue with error: ${new Error(err.message)}`
            })
        }

        if(count>0){
            return res.status(403).json({
                msg:`You have already registed to take a new task when a new job is created!`
            })
        }

        let queue = new Queue({
            staff:req.user._id
        });

        console.log(queue)
    
        await queue
        .save()
        .then(_=>{
            return res.status(201).json({
                msg:`You have registed get more task successfully!`
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not register more task with error: ${new Error(err.message)}`
            })
        })
    })

   

})

module.exports = router;