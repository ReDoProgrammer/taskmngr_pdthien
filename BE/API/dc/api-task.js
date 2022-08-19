const router = require("express").Router();
const Task = require("../../models/task-model");
const { authenticateDCToken } = require("../../../middlewares/dc-middleware");
const {
    GetTask,
    GetCustomerById,
    getWage
} = require('../common');
const { ValidateCheckIn } = require('../../../middlewares/checkin-middleware');

const _MODULE = 'DC';
const pageSize = 20;

router.put('/mark', [authenticateDCToken, ValidateCheckIn], async (req, res) => {
    let { taskId, bpId, costs, remark } = req.body;
    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        });
    }

    task.bp.push({
        bpId,
        costs,
        remark,
        created: {
            at: new Date(),
            by: req.user._id
        }
    });

    await task.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Bonus/Penalty has been set successfully!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not set bonus/penalty with error: ${new Error(err.message)}`
            })
        })
})

router.put('/submit', [authenticateDCToken, ValidateCheckIn], async (req, res) => {
    let { taskId } = req.body;

    //validate asif the task has been submited before
    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    let dc = task.dc.filter(x => x.staff == req.user._id && !x.unregisted && !x.submited_at);
    dc[0].submited_at = new Date();
    task.status = 3;

    await task.save()
        .then(_ => {
            return res.status(200).json({
                msg: `The task has been submited!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `This task can not be submited with error: ${new Error(err.message)}`
            })
        })


})

router.put('/unregister', [authenticateDCToken, ValidateCheckIn], async (req, res) => {
    let { taskId } = req.body;

    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }



    let dc = task.dc.filter(x => x.staff == req.user._id && !x.unregisted);
    if (dc.length == 0) {
        return res.status(404).json({
            msg: `DC not found!`
        })
    }

    dc[dc.length - 1].unregisted = true;
    await task.save()
        .then(_ => {
            return res.status(200).json({
                msg: `You have unregister this task successfully!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `You can not unregister this task with error: ${new Error(err.message)}`
            })
        })
})


router.put('/get-task', [authenticateDCToken, ValidateCheckIn], async (req, res) => {
    let { taskId } = req.body;
    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    //Nếu task đã được submit trước đó
    if (task.status == 3) {
        return res.status(403).json({
            msg: `This task have been already submited by another DC!`
        })
    }

    /*
        DC muốn nhận task thì phải đợi ít nhất đc Editor submit
        Không nhất thiết phải được Q.A submit
        Tuy nhiên nếu có Q.A thì phải đợi Q.A submit thì DC mới nhận được task
    */
    if ((task.qa.length == 0 && task.status < 1) || (task.qa.length > 0 && task.status < 2)) {
        return res.status(403).json({
            msg: `Task status is invalid. Please wait Editor/QA submits it!`
        })
    }


    //Nếu task đã được DC khác nhận
    if (task.dc.length > 0 && task.dc[task.dc.length - 1].staff != req.user._id && !task.dc[task.dc.length - 1].unregisted) {
        return res.status(403).json({
            msg: `This task has been registed by another DC!`
        })
    }

    getWage(req.user._id, _MODULE, task.basic.level.toString())
        .then(async wage => {
            task.dc.push({
                staff: req.user._id,
                got_at: new Date(),
                wage
            });
            await task.save()
                .then(_ => {
                    return res.status(200).json({
                        msg: `You have registed this task successfully!`
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not get task with error: ${new Error(err.message)}`
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

router.put('/reject', [authenticateDCToken, ValidateCheckIn], async (req, res) => {
    let { taskId, remark } = req.body;

    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    if (task.status == -3) {
        return res.status(403).json({
            msg: `This task has been already rejected!`
        })
    }

    task.remarks.push({
        content: remark,
        created: {
            by: req.user._id,
            at: new Date()
        }
    })

    task.status = -3;
    task.dc[task.dc.length - 1].rejected.push({
        at: new Date(),
        by: req.user._id
    })

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


router.get('/personal-tasks', authenticateDCToken, async (req, res) => {
    let { page, search, status } = req.query;
    let stt = (status.split(',')).map(x => {
        return parseInt(x.trim());
    })

    console.log(stt)

    let tasks = await Task
        .find({
            status: { $in: stt },
            'dc.staff': req.user._id,
            'dc.unregisted': false
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
            { path: 'editor.staff', select: 'username fullname' },
            { path: 'qa.staff', select: 'username fullname' },
            { path: 'bp.bpId', select: 'is_bonus' },
            {path:'canceled.reason',select:'name'}
        ]);

    let count = await Task.countDocuments({});
    return res.status(200).json({
        msg: `Load tasks list successfully!`,
        tasks,
        pageSize,
        pages: count % pageSize == 0 ? count / pageSize : Math.floor(count / pageSize) + 1
    })
})


router.get('/list', authenticateDCToken, async (req, res) => {
    let { page, search, status } = req.query;
    let stt = (status.split(',')).map(x => {
        return parseInt(x.trim());
    })

    let tasks = await Task
        .find({
            status: { $in: stt }
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
            { path: 'editor.staff', select: 'fullname username' },
            { path: 'qa.staff', select: 'fullname username' },
            { path: 'dc.staff', select: 'fullname username' },
            { path: 'remarks' },
            { path: 'bp.bpId', select: 'is_bonus' },
            {path:'canceled.reason',select:'name'}
        ]);

    let count = await Task.countDocuments({});

    return res.status(200).json({
        msg: `Load tasks list successfully!`,
        tasks,
        pageSize,
        pages: count % pageSize == 0 ? count / pageSize : Math.floor(count / pageSize) + 1
    })

})

router.get('/detail', authenticateDCToken, (req, res) => {
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


module.exports = router;


