const router = require("express").Router();
const Task = require("../../models/task-model");
const Remark = require('../../models/remark-model');
const CheckIn = require('../../models/staff-checkin');
const { authenticateQAToken } = require("../../../middlewares/qa-middleware");
const { getWage, getModule, getCustomer, getTaskDetail } = require('../common');
const _MODULE = 'QA';

const { getTask } = require('./get-task')


router.put('/unregister', authenticateQAToken, async (req, res) => {
    let { taskId } = req.body;
    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    task.qa[task.qa.length - 1].unregisted = true;
    await task.save()
        .then(_ => {
            return res.status(200).json({
                msg: `You have unregisted this task successfully!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not unregister this task with error: ${new Error(err.message)}`
            })
        })

})

router.put('/get-task', authenticateQAToken, (req, res) => {
    CheckIn
        .findOne({ staff: req.user._id })
        .then(chk => {
            if (!chk) {
                return res.status(404).json({
                    msg: `Staff check in not found!`
                })
            }

            if (chk.check[chk.check.length - 1].out == undefined) {
                getTask(req.user._id)
                    .then(async rs => {

                        let task = rs.task;
                        task.qa.push({
                            staff: req.user._id,
                            timestamp: new Date(),
                            wage: rs.wage.wage
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
            } else {
                return res.status(403).json({
                    msg: `You can not get more task when you are not in office!`
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load staff checkin with error: ${new Error(err.message)}`
            })
        })
})

router.put('/submit', authenticateQAToken, async (req, res) => {
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

router.put('/reject', authenticateQAToken, async (req, res) => {
    let { taskId, remark } = req.body;

    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    if (task.qa.length == 0) {
        return res.status(404).json({
            msg: `Q.A not found!`
        })
    }

    let rm = new Remark({
        user: req.user._id,
        content: remark,
        tid: taskId
    });

    await rm.save()
        .then(async _ => {
            task.remarks.push(rm);
            task.qa[task.qa.length - 1].rejected.push({
                at: new Date(),
                by: req.user._id,
                rm: rm._id
            });
            task.status = -2;

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
                msg: `Can not created remark with error: ${new Error(err.message)}`
            })
        })
})

router.get('/detail', authenticateQAToken, (req, res) => {
    let { taskId } = req.query;

    getTaskDetail(taskId)
        .then(async t => {
            await getCustomer(t.basic.job.customer)
                .then(customer => {
                    return res.status(200).json({
                        msg: `Get task info successfully!`,
                        customer,
                        task: t
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

router.get('/personal', authenticateQAToken, (req, res) => {
    let { page, search, status } = req.query;
    if (status == 100) {
        Task
            .find({
                'qa.staff': req.user._id,
                'qa.unregisted': false
            })
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
                    msg: `Load tasks list successfully!`,
                    tasks
                })
            })
            .catch(err => {
                return res.status(500).json({
                    msg: `Can not get tasks list with error: ${new Error(err.message)}`
                })
            })
    } else {
        Task
            .find({
                status
            })
            .populate({
                path: 'job',
                populate: {
                    path: 'customer'
                }
            })
            .populate('level')

            .exec()
            .then(tasks => {
                return res.status(200).json({
                    msg: `Load tasks list successfully!`,
                    tasks
                })
            })
            .catch(err => {
                return res.status(500).json({
                    msg: `Can not get tasks list with error: ${new Error(err.message)}`
                })
            })
    }
})



module.exports = router;


