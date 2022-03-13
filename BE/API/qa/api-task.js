const router = require("express").Router();
const Task = require("../../models/task-model");
const { authenticateQAToken } = require("../../../middlewares/qa-middleware");
const { getWage, getModule, getCustomer, getTaskDetail } = require('../common');
const _MODULE = 'QA';

router.put('/unregister', authenticateQAToken, (req, res) => {
    let { taskId } = req.body;
    Task
        .findByIdAndUpdate(taskId, {
            qa: null,
            qa_assigned_date: new Date()//danh dau thoi gian Q.A huy nhan task
        }, { new: true }, (err, task) => {
            if (err) {
                return res.status(500).json({
                    msg: `Can not unregister task with error: ${new Error(err.message)}`
                })
            }

            if (!task) {
                return res.status(404).json({
                    msg: `Can not unregister this task because it\'s not found`
                })
            }

            return res.status(200).json({
                msg: `The task have been unregisted successfully!`,
                task
            })
        })

})

router.put('/get-task', authenticateQAToken, (req, res) => {
    let { taskId } = req.body;
    Task
        .countDocuments({
            /*
                kiểm tra số task mà Q.A đang nhận chưa submit
                nếu quá 2 task thì sẽ không được nhận thêm task
            */
            qa: req.user._id,
            qa_assigned: false,
            status: { $in: [0, 1] }
        }, async (err, count) => {
            if (err) {
                return res.status(500).json({
                    msg: `Can not check task have been processing with error: ${new Error()}`
                })
            }
            if (count > 2) {
                return res.status(403).json({
                    msg: `You can not get more task when your tasks have been not submited!`
                })
            }

            /*
                Kiểm tra xem task được nhận có phù hợp với trình độ của Q.A 
                và đã được thiết lập tiền công rồi hay chưa
            */
            await getTaskDetail(taskId)//lay thong tin task
                .then(async task => {
                    await getModule(_MODULE)//lay module
                        .then(async m => {
                            getWage(req.user._id, task.level._id, m._id)//kiem tra xem level va q.a nay da duoc set tien cong chua
                                .then(async w => {
                                    await Task
                                        .findByIdAndUpdate(taskId, {
                                            qa: req.user._id,
                                            assigned_date: new Date(),
                                            qa_wage: w.wage
                                        }, { new: true }, (err, task) => {
                                            if (err) {
                                                return res.status(500).json({
                                                    msg: `Can not get task with error: ${new Error(err.message)}`
                                                })
                                            }

                                            return res.status(200).json({
                                                msg: `Get task successfully!`,
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

router.put('/submit', authenticateQAToken, (req, res) => {
    let { taskId } = req.body;

    Task
        .findByIdAndUpdate(taskId, {
            qa_done: new Date(),
            status: 2
        }, { new: true }, (err, task) => {
            if (err) {
                return res.status(500).json({
                    msg: `Can not submit this task with error: ${new Error(err.message)}`
                })
            }

            return res.status(200).json({
                msg: `The task has been submited!`,
                task
            }

            )
        })




})

router.put('/reject', authenticateQAToken, (req, res) => {
    let { taskId, remark } = req.body;

    Task
        .findByIdAndUpdate(taskId, {
            qa_done: new Date(),
            status: -2,
            qa: req.user._id,
            remark
        },
            { new: true },
            (err, task) => {
                if (err) {
                    return res.status(500).json({
                        msg: `Can not reject task with error: ${new Error(err.message)}`
                    })
                }

                if (!task) {
                    return res.status(404).json({
                        msg: `Task not found!!`
                    })
                }

                return res.status(200).json({
                    msg: `The task has been rejected!`,
                    task
                })
            })
})

router.get('/list', authenticateQAToken, (req, res) => {
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

router.get('/detail', authenticateQAToken, (req, res) => {
    let { taskId } = req.query;
    getTaskDetail(taskId)
        .then(async t => {
            await getCustomer(t.job.customer)
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
            .find({ qa: req.user._id })
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


