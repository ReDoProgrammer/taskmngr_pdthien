const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Task = require('../../models/task-model');
const moment = require('moment');

router.get('/list', authenticateTLAToken, (req, res) => {
    let { jobId } = req.query;
    Task
        .find({ job: jobId })
        .populate('level', 'name -_id')
        .populate('staff','fullname -_id')
        .exec()
        .then(tasks => {
            return res.status(200).json({
                tasks,
                msg: 'Load tasks by job id successfully!'
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load task with job ${jobId}`,
                error: new Error(err.message)
            })
        })
})

router.get('/', authenticateTLAToken, (req, res) => {
    let { page, search } = req.query;
    Task
        .find(
            {
                // $or: [
                //     { firstname: { "$regex": search, "$options": "i" } },
                // ]
            }
        )
        .populate('level')
        .exec()
        .then(tasks => {           
            return res.status(200).json({
                msg: 'Load tasks list successfully!',
                tasks
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load taks list with error: ${new Error(err.message)}`
            })
        })

})

router.get('/detail', authenticateTLAToken, (req, res) => {

})

router.post('/', authenticateTLAToken, (req, res) => {
    let { job, level, remark } = req.body;
    let task = new Task({
        job,
        level,
        remark
    });
    task.save()
        .then(_ => {
            return res.status(201).json({
                msg: `Task has been created`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not create task with error: ${new Error(err.message)}`,
                error: new Error(err.message)
            })
        })

})

router.put('/', authenticateTLAToken, (req, res) => {
    let {taskId,staff,qa,editor} = req.body;
    Task.findByIdAndUpdate(taskId,{
        staff,
        qa,
        editor
    },{new:true},(err,task)=>{
        if(err){
            return res.status(500).json({
                msg:`Assign task failed with error: ${new Error(err.message)}`,
                error: new Error(err.message)
            })
        }
        return res.status(200).json({
            msg:`Assign staff successfully!`
        })
    })
})

router.delete('/', authenticateTLAToken, (req, res) => {
    let { _id } = req.body;
    Task.findByIdAndDelete(_id)
        .exec()
        .then(_ => {
            return res.status(200).json({
                msg: 'Task has been deleted!'
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this task`,
                error: `Error found: ${new Error(err.message)}`
            })
        })
})


module.exports = router;