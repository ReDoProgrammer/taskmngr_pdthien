const router = require("express").Router();
const Task = require("../../models/task-model");
const CheckIn = require('../../models/staff-checkin');
const { authenticateQAToken } = require("../../../middlewares/qa-middleware");
const { ValidateCheckIn } = require('../../../middlewares/checkin-middleware');
const {
    GetTask,
    GetCustomerById } = require('../common');
const _MODULE = 'QA';

const { getTask } = require('./get-task')
const pageSize = 20;

router.put('/unregister', [authenticateQAToken, ValidateCheckIn], async (req, res) => {
    let { taskId } = req.body;
    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    task.qa[task.qa.length - 1].unregisted = true;

    console.log('task ne: ', task)

    // await task.save()
    //     .then(_ => {
    //         return res.status(200).json({
    //             msg: `You have unregisted this task successfully!`
    //         })
    //     })
    //     .catch(err => {
    //         return res.status(500).json({
    //             msg: `Can not unregister this task with error: ${new Error(err.message)}`
    //         })
    //     })

})

router.put('/get-task', [authenticateQAToken, ValidateCheckIn], async (req, res) => {
    let count = await Task.countDocuments({
        status: 1,
        'qa.staff': req.user._id,
        'qa.visible': true
    });


    if (count > 0) {
        return res.status(403).json({
            msg: `Can not get more tasks when your current tasks have been not submited!`
        })
    }



    getTask(req.user._id)
        .then(async rs => {
            let task = rs.task;

            task.qa.push({
                staff: req.user._id,
                timestamp: new Date(),
                wage: rs.wage
            })
            await task.save()
                .then(_ => {
                    return res.status(200).json({
                        msg: `You have gotten more task successfully!`,
                        task
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Get more task failed with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            console.log(err)
            return res.status(err.code).json({
                msg: err.msg
            })
        })
})

router.put('/submit', [authenticateQAToken, ValidateCheckIn], async (req, res) => {
    let { taskId } = req.body;

    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    task.qa[task.qa.length - 1].submited_at.push(new Date());
    task.status = 2;

    await task.save()
        .then(t => {
            return res.status(200).json({
                msg: `The task has been submited!`,
                t
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not submit this task with error: ${new Error(err.message)}`
            })
        })
})

router.put('/reject', [authenticateQAToken, ValidateCheckIn], async (req, res) => {
    let { taskId, remark } = req.body;

    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    if (task.status >= 2) {
        return res.status(403).json({
            msg: `The task has been already submited!`
        })
    }

    task.remarks.push({
        content: remark,
        created: {
            by: req.user._id,
            at: new Date()
        }
    })
    task.qa[task.qa.length - 1].rejected.push({
        at: new Date(),
        by: req.user._id
    })
    task.status = -2;

    await task.save()
        .then(_ => {
            return res.status(200).json({
                msg: `You have rejected the task successfully!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not reject this task with error: ${new Error(err.message)}`
            })
        })
})

router.get('/detail', authenticateQAToken, (req, res) => {
    let { taskId } = req.query;

    GetTask(taskId)
        .then(task => {
            GetCustomerById(task.basic.job.customer)
                .then(customer => {
                    return res.status(200).json({
                        msg: `Get task detail successfully!`,
                        task,
                        customer
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

router.get('/personal', authenticateQAToken, async (req, res) => {
    let { page, search, status } = req.query;
    let stt = (status.split(',')).map(x => {
        return parseInt(x.trim());
    })

    let tasks = await Task
        .find({
            status: { $in: stt },
            'qa.staff': req.user._id,
            'qa.visible': true
        })
        .sort({ 'deadline.end': 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate([
            {
                path: 'basic.job',
                populate: {
                    path: 'customer',
                    select: 'name.firstname name.lastname'
                }
            },
            {
                path: 'basic.level',
                select: 'name'
            },
            { path: 'editor.staff' },
            { path: 'qa.staff' },
            { path: 'remarks' }
        ]);

    let count = await Task.countDocuments({});

    return res.status(200).json({
        msg: `Load tasks list successfully!`,
        tasks,
        pageSize,
        pages: count % pageSize == 0 ? count / pageSize : Math.floor(count / pageSize) + 1
    })
})



module.exports = router;


