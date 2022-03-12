const router = require("express").Router();
const Task = require("../../models/task-model");
const { authenticateQAToken } = require("../../../middlewares/qa-middleware");
const { getWage,getModule, getCustomer,getTaskDetail } = require('../common');
const _MODULE = 'QA';

router.put('/submit', authenticateQAToken, (req, res) => {
    let { taskId, job_lv } = req.body;

    Task.findById(taskId)
        .exec()
        .then(t => {
            if (!t) {
                return res.status(404).json({
                    msg: `Task not found!`
                })
            }
            if (t.qa !== req.user._id) {
                return res.status(403).json({
                    msg: `This task has been already submited by another Q.A!`
                })
            }
            getModule(_MODULE)
            .then(m=>{
                getWage(req.user._id, job_lv, m._id)
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

                            return res.status(200).json({
                                msg: `The task has been submited!`
                            })
                        })

                })
                .catch(err => {
                    return res.status(err.code).json({
                        msg:err.msg
                    })
                })
            })
            .catch(err=>{
                return res.status(err.code).json({
                    msg:err.msg
                })
            })
            

        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get task by id with error: ${new Error(err.message)}`
            })
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
    .then(async t=>{
        await getCustomer(t.job.customer)
        .then(customer=>{
            return res.status(200).json({
                msg:`Get task info successfully!`,
                customer,
                task:t
            })
        })
        .catch(err=>{
            return res.status(err.code).json({
                msg:err.msg
            })
        })
    })
    .catch(err=>{
        return res.status(err.code).json({
            msg:err.msg
        })
    })
})



module.exports = router;


