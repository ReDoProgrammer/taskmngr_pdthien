const router = require('express').Router();
const Queue = require('../../models/queue-model');
const Task = require('../../models/task-model');
const StaffJobLevel = require('../../models/staff-job-level-model');
const User = require('../../models/user-model');
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const _EDITOR = 'EDITOR';

router.post('/', authenticateTLAToken, async (req, res) => {

    let { taskId } = req.body;   
   
   let task = await Task.findById(taskId);

   if(!task){
       return res.status(404).json({
           msg:`Task not found!`
       })
   }

   Queue
   .find({})
   .sort({
    timestamp:-1
   })
   .exec()
   .then(async q=>{
        if(q.length == 0){
            return res.status(404).json({
                msg:`No editor registed to get more task`
            })
        }

        // await User
        // .find({_id:{$in:}})
        // .exec()
        // .then(user=>{
        //     console.log(user)
        // })
        // .catch(err=>{
        //     return res.status(500).json({
        //         msg:`Can not get user with error: ${new Error(err.message)}`
        //     })
        // })


        // await StaffJobLevel
        // .find({})
        // .exec()
        // .then(async sjl=>{
        //     // console.log(sjl)
        // })
        // .catch(err=>{
        //     return res.status(500).json({
        //         msg:`Can not get staff job level with error: ${new Error(err.message)}`
        //     })
        // })
   })
   .catch(err=>{
       return res.status(500).json({
           msg:`Can not get queue with error: ${new Error(err.message)}`
       })
   })


   //gán editor
//    await getModule(_EDITOR)
//    .then(async m => {
//        await getWage(editor, level, m._id)
//            .then(async w => {
//                let ed = {
//                    staff: editor,
//                    wage: w.wage,
//                    tla: req.user._id,
//                    timestamp: new Date()
//                };

//                task.editor.push(ed);

//            })
//            .catch(err => {
//                return res.status(err.code).json({
//                    msg: err.msg
//                })
//            })
//    })
//    .catch(err => {
//        return res.status(err.code).json({
//            msg: err.msg
//        })
//    })


})

module.exports = router;





