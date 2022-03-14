const router = require("express").Router();
const Task = require("../../models/task-model");
const Remark = require('../../models/remark-model');
const { authenticateDCToken } = require("../../../middlewares/dc-middleware");
const { getCustomer, getTaskDetail, getModule, getWage } = require('../common');
const _MODULE = 'DC';


router.put('/submit', authenticateDCToken, (req, res) => {
    let { taskId } = req.body;

    //validate asif the task has been submited before
    Task
        .countDocuments({ _id: taskId, status: 3 }, (err, count) => {
            if (err) {
                return res.status(500).json({
                    msg: `Can not check task as if that has been submited before with error: ${new Error(err.message)}`
                })
            }
            if (count > 0) {
                return res.status(403).json({
                    msg: `The task has been submited before!`
                })
            }
            Task
                .findByIdAndUpdate(taskId, {
                    status: 3
                }, { new: true }, (err, task) => {
                    if (err) {
                        return res.status(500).json({
                            msg: `Can not submit task with error: ${new Error(err.message)}`
                        })
                    }
                    if (!task) {
                        return res.status(404).json({
                            msg: `Task not found so it can not be submited!`
                        })
                    }
                    return res.status(200).json({
                        msg: `The task has been submited!`,
                        task
                    })
                })
        })


})

router.put('/unregister', authenticateDCToken, (req, res) => {
    let { taskId } = req.body;
    Task
        .findByIdAndUpdate(taskId, {
            dc: null
        }, { new: true }, (err, task) => {
            if (err) {
                return res.status(500).json({
                    msg: `Can not unregister this task with error: ${new Error(err.message)}`
                })
            }

            if (!task) {
                return res.status(404).json({
                    msg: `Can not unregister this task because it\' not found!`
                })
            }

            return res.status(200).json({
                msg: `You have unregister this task successfully!`,
                task
            })
        })
})


router.put('/get-task', authenticateDCToken, (req, res) => {
    let { taskId } = req.body;

    Task
        .countDocuments({
            dc: req.user._id,
            status: { $in: [1, 2] }
        }, async (err, count) => {          
            if (err) {
                return res.status(500).json({
                    msg: `Can not check tasks have been registed with error: ${new Error(err.message)}`
                })
            }

            if (count >= 2) {
                return res.status(403).json({
                    msg: `You can not get more task ultil your tasks have been submited!`
                })
            }

            await getTaskDetail(taskId)
                .then(async t => {
                    if (t.dc !== null && typeof t.dc !== 'undefined') {
                        return res.status(403).json({
                            msg: `This task has been already registed by another DC`
                        })
                    }

                    await getModule(_MODULE)
                        .then(async m => {
                            await getWage(req.user._id, t.level._id, m._id)
                                .then(async w => {
                                    await Task
                                        .findByIdAndUpdate(taskId, {
                                            dc: req.user._id,
                                            dc_get: new Date(),
                                            dc_wage: w.wage
                                        }, { new: true }, (err, task) => {
                                            if (err) {
                                                return res.status(500).json({
                                                    msg: `Can not register this task with error: ${new Error(err.message)}`
                                                })
                                            }

                                            return res.status(200).json({
                                                msg: `The task has been registed successfully!`,
                                                task
                                            })
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
                .catch(err => {
                    return res.status(err.code).json({
                        msg: err.msg
                    })
                })
        })


})

router.put('/reject', authenticateDCToken, (req, res) => {
    let { taskId, remark } = req.body;

    getTaskDetail(taskId)
        .then(async task => {
            let rm = new Remark({
                user: req.user._id,
                content: remark,
                tid: task._id
            });

            await rm.save()
                .then(async r => {
                    task.remarks.push(r);
                    task.status = -3;
                    await task.save()
                        .then(t => {
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
        .catch(err => {
            return res.status(err.code).json({
                msg: err.msg
            })
        })
})


router.get('/personal-tasks', authenticateDCToken, (req, res) => {
    let { page, search, status } = req.query;
    if (status == 100) {
        Task
            .find({ dc: req.user._id })
            .populate({
                path: 'job',
                populate: {
                    path: 'customer'
                }
            })
            .populate('level')
            .populate('editor')
            .populate('qa')
            .populate('dc')
            .populate({
                path:'remarks',
                options: {
                    limit: 1,
                    sort: { timestamp: -1}   
                }
            })
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
                status,
                dc: req.user._id
            })
            .populate({
                path: 'job',
                populate: {
                    path: 'customer'
                }
            })
            .populate('level')
            .populate('editor')
            .populate('qa')
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


router.get('/list', authenticateDCToken, (req, res) => {
    let { page, search, status } = req.query;
    if (status == 100) {
        Task
            .find({})
            .populate({
                path: 'job',
                populate: {
                    path: 'customer'
                }
            })
            .populate('level')
            .populate('editor')
            .populate('qa')
            .populate('dc')
            .populate({
                path:'remarks',
                options: {
                    limit: 1,
                    sort: { timestamp: -1}   
                }
            })
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
            .populate('editor')
            .populate('qa')
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

router.get('/detail', authenticateDCToken, (req, res) => {
    let { taskId } = req.query;
    getTaskDetail(taskId)
        .then(async task => {
            await getCustomer(task.job.customer)
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


module.exports = router;


