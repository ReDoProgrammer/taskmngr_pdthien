const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Task = require('../../models/task-model');
const { getCustomer, getTaskDetail, getModule, getWage } = require('../common');



router.get('/list', authenticateSaleToken, (req, res) => {
    let { jobId } = req.query;
    Task
        .find({ 'basic.job': jobId })
        .populate([
            {
                path: 'basic.job',
                populate: {
                    path: 'customer'
                }
            },
            {
                path: 'basic.level',
                select: 'name'
            },
            {
                path: 'editor.staff',
                select: 'fullname username'
            },
            {
                path: 'qa.staff',
                select: 'fullname'
            },
            {
                path: 'dc.staff',
                select: 'fullname'
            },
            {
                path: 'tla.created.by',
                select: 'fullname'
            },
            {
                path: 'tla.uploaded.by',
                select: 'fullname'
            },
            {
                path: 'remarks',
                options: { sort: { 'timestamp': -1 } }
            }
        ])
        .exec()
        .then(tasks => {
            return res.status(200).json({
                tasks,
                msg: 'Load tasks by job id successfully!'
            })
        })
        .catch(err => {
            console.log(`Can not load task with job ${jobId}`);
            return res.status(500).json({
                msg: `Can not load task with job ${jobId}`,
                error: new Error(err.message)
            })
        })
})


router.get('/all', authenticateSaleToken, (req, res) => {
    let { page, search, status } = req.query;
    Task
        .find({})
        .populate([
            {
                path: 'basic.job',
                populate: {
                    path: 'customer'
                }
            },
            {
                path: 'basic.level',
                select: 'name'
            },
            {
                path: 'editor.staff',
                select: 'fullname'
            },
            {
                path: 'qa.staff',
                select: 'fullname'
            },
            {
                path: 'dc.staff',
                select: 'fullname'
            },
            {
                path: 'tla.created.by',
                select: 'fullname'
            },
            {
                path: 'tla.uploaded.by',
                select: 'fullname'
            },
            {
                path: 'remarks',
                options: { sort: { 'timestamp': -1 } }
            }
        ])
        .exec()
        .then(tasks => {
            return res.status(200).json({
                tasks,
                msg: 'Load taskslist successfully!'
            })
        })
        .catch(err => {
            console.log(`Can not load tasks list with error:  ${jobId}`);
            return res.status(500).json({
                msg: `Can not load tasks list with error: ${jobId}`,
                error: new Error(err.message)
            })
        })
})

router.get('/detail', authenticateSaleToken, (req, res) => {
    let { taskId } = req.query;
    getTaskDetail(taskId)
        .then(async task => {
            await getCustomer(task.basic.job.customer)
                .then(customer => {
                    return res.status(200).json({
                        msg: `Get task info successfully!`,
                        customer,
                        task
                    })
                })
                .catch(err => {
                    return res.status(err.code).json({
                        msg: err.msg
                    })
                })
        })
        .catch(err => {
            return res.status(err.code).json({
                msg: err.msg
            })
        })
})

router.put('/submit', authenticateSaleToken, async (req, res) => {
    let { taskId } = req.body;
    let task = await Task.findById(taskId);
    if(!task){
        return res.status(404).json({
            msg:`Task not found!`
        })
    }
    task.status = 5;
    task.done.push({
        at: new Date(),
        by:req.user._id
    })

    await task.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Task has been submited!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not submit this task with error: ${new Error(err.message)}`
        })
    })
   
})


router.put('/reject', authenticateSaleToken, async (req, res) => {
    let { taskId, remark } = req.body;

    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    let rmk = new Remark({
        tid: taskId,
        user: req.user._id,
        content: remark
    });
    await rmk.save()
        .then(async r => {
            task.remarks.push(rmk);
            task.rejected_by = req.user._id;
            task.rejected_at = new Date();
            task.status = -4;
            task.updated_by = req.user._id;
            task.updated_at = new Date();

            await task.save()
                .then(_ => {
                    return res.status(200).json({
                        msg: `The task has been rejected!`
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not reject this task with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not insert reject remark with error: ${new Error(err.message)}`
            })
        })
})
module.exports = router;