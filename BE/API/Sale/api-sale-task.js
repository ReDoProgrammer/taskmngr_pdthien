const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Task = require('../../models/task-model');
const {
    GetTask,
    GetCustomerById } = require('../common');

const pageSize = 20;
router.get('/list-available-tasks',authenticateSaleToken,async (req,res)=>{
    //ham tra ve nhung task da upload boi TLA
    //de Sale co the CC vao nhung task nay
    let {jobId} = req.query;
    let tasks = await Task.find({
      'basic.job':jobId,
      status:{$gte:4}
    })
    .populate([
        {path:'basic.level',select:'name'},
        {path:'basic.mapping',select:'name'}
    ])
    .select('basic.level.name basic.mapping.name');
    return res.status(200).json({
      msg:`Load available tasks successfully!`,
      tasks
    })
  })
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
            { path: 'basic.level', select: 'name'},
            { path: 'editor.staff', select: 'fullname username' },
            { path: 'qa.staff', select: 'fullname username' },
            { path: 'dc.staff', select: 'fullname username' },
            { path: 'tla.created.by', select: 'fullname username' },
            { path: 'tla.uploaded.by', select: 'fullname username' },
            { path: 'remarks.created.by' },
            {path:'canceled.reason',select:'name'}

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


router.get('/all', authenticateSaleToken, async (req, res) => {
    let { page, search, status } = req.query;
    let stt = (status.split(',')).map(x => {
        return parseInt(x.trim());
    })

    let tasks = await Task
        .find({ status: { $in: stt } })
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
                path:'basic.job',
                populate:{
                    path:'cc'
                }
            },
            { path: 'basic.level', select: 'name' },
            { path: 'editor.staff', select: 'username fullname' },
            { path: 'qa.staff', select: 'username fullname' },
            { path: 'dc.staff', select: 'username fullname' },
            { path: 'tla.uploaded.by', select: 'username fullname' },
            { path: 'remarks' },
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

router.get('/detail', authenticateSaleToken, (req, res) => {
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

router.put('/submit', authenticateSaleToken, async (req, res) => {
    let { taskId,free,unwage } = req.body;
    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }
    task.status = 5;
    task.paid.free = free;
    task.paid.unwage = unwage;
    task.done.push({
        at: new Date(),
        by: req.user._id
    })

    await task.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Task has been submited!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not submit this task with error: ${new Error(err.message)}`
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