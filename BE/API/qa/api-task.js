const router = require("express").Router();
const Task = require("../../models/task-model");
const { authenticateQAToken } = require("../../../middlewares/qa-middleware");
const {getWage } = require('../common');
const _MODULE = 'QA';

router.put('/submit', authenticateQAToken, (req, res) => {
    let { taskId, job_lv } = req.body;


    getWage(req.user._id, job_lv, _MODULE)
        .then(w => {
            Task
                .findByIdAndUpdate(taskId, {
                    qa: req.user._id,
                    qa_wage: w.wage,
                    qa_done: new Date(),
                    status: 2
                }, { new: true }, (err, task) => {
                    if (err) {
                        return res.status(500).json({
                            msg: `Can not find and update task by id with error: ${new Error(err.message)}`
                        })
                    }
                    if (!task) {
                        return res.status(404).json({
                            msg: `Task not found!`
                        })
                    }

                    return res.status(200).json({
                        msg: `The task has been submited!`
                    })
                })

        })
        .catch(err => {
            console.log(err);
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
    Task
        .find({
            status
        })
        .populate('job')
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
})

router.get('/detail', authenticateQAToken, (req, res) => {
    let { taskId } = req.query;




    Task.findById(taskId)
        .populate('level', 'name')
        .populate('job')
        .exec()
        .then(task => {
            if (!task) {
                return res.status(404).json({
                    msg: `Task not found!`
                })
            }

            getCustomer(task.job.customer)
                .then(result => {
                    console.log(result);
                    return res.status(200).json({
                        msg: `Load task detail successfully!`,
                        task,
                        customer: result.customer
                    })
                })
                .catch(err => {
                    return res.status(err.code).json({
                        msg: err.msg
                    })
                })


        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get task info with error: ${new Error(err.message)}`
            })
        })
})


module.exports = router;


