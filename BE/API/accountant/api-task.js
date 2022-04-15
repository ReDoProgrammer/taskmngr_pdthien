const router = require('express').Router();
const Task = require('../../models/task-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");
const { getTaskDetail, getCustomer } = require('../common');


router.get('/list-by-job', authenticateAccountantToken, (req, res) => {
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

router.get('/list', authenticateAccountantToken, (req, res) => {
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

router.get('/list-payment', authenticateAccountantToken, (req, res) => {
    let { page, search } = req.query;
    Task
        .find({ status: 5 })
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
                msg: 'Load paid tasks list successfully!'
            })
        })
        .catch(err => {
            console.log(`Can not load paid tasks list: ${jobId}`);
            return res.status(500).json({
                msg: `Can not load paid tasks list: ${jobId}`,
                error: new Error(err.message)
            })
        })
})

router.get('/detail', authenticateAccountantToken, (req, res) => {
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

router.put('/paid', authenticateAccountantToken, (req, res) => {
    let { paidArray } = req.body;
    let correct = true;
    let err;
    paidArray.forEach(async p => {
        let task = await Task.findById(p);
        if (task.status === 5) {
            task.status = 6;
            let finished = {
                at: new Date(),
                by: req.user._id,
                paid: true
            }
            task.finished = finished;
            await task.save()
                .then(_ => {

                })
                .catch(err => {
                    correct = false;
                    err = err;
                })
        }

    })

    if (!correct) {
        return res.status(500).json({
            msg: `Can not give payment with error: ${new Error(err.message)}`
        })
    } else {
        return res.status(200).json({
            msg: `You have given payment successfully!`
        })
    }
})


module.exports = router;