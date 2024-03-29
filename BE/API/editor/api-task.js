const router = require("express").Router();
const Task = require("../../models/task-model");

const {
    GetTask,
    GetCustomerById } = require('../common');


const { getTask } = require('./get-task')

const { authenticateEditorToken } = require("../../../middlewares/editor-middleware");
const { ValidateCheckIn } = require('../../../middlewares/checkin-middleware');

const pageSize = 20;


router.get('/statistic', authenticateEditorToken, (req, res) => {
    Task
        .find({ editor: req.user._id })
        .exec()
        .then(tasks => {
            var total = tasks.length;
            var rejected = (tasks.filter(x => x.status <= -2 && x.status >= -4)).length;
            var canceled = (tasks.filter(x => x.status === -5)).length;
            var done = (tasks.filter(x => x.status >= 5)).length;
            var edited = (tasks.filter(x => x.status >= 1 && x.status < 5 && x.edited_time === 1)).length;
            var fixed = (tasks.filter(x => x.edited_time > 1)).length;
            var processing = (tasks.filter(x => x.status === 0)).length;
            return res.status(200).json({
                msg: `Get tasks statistic successfully!`,
                total,
                rejected,
                canceled,
                done,
                edited,
                fixed,
                processing
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get tasks statistic with error: ${new Error(err.message)}`
            })
        })
})




router.get('/', authenticateEditorToken, async (req, res) => {
    let { page, search, status } = req.query;
    let stt = (status.split(',')).map(x => {
        return parseInt(x.trim());
    })

    let tasks = await Task
        .find({
            status: { $in: stt },
            'editor.staff': req.user._id,
            'editor.visible': true
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
            { path: 'editor.staff', select:'username fullname' },
            { path: 'qa.staff' , select:'username fullname' },
            { path: 'dc.staff' , select:'username fullname' },
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


router.get('/detail', authenticateEditorToken, (req, res) => {
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


router.put('/submit', [authenticateEditorToken, ValidateCheckIn], async (req, res) => {
    let { taskId, output_link, amount } = req.body;

    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    task.editor[task.editor.length - 1].submited.push({
        at: new Date(),
        amount: amount,
        link: output_link
    });
    task.status = 1;
    await task.save()
        .then(t => {
            return res.status(200).json({
                msg: `The task has been submited!`,
                t
            })
        })
        .catch(err => {
            console.log(`Can not submit this task with error: ${new Error(err.message)}`);
            return res.status(500).json({
                msg: `Can not submit this task with error: ${new Error(err.message)}`
            })
        })



})


router.put('/change-amount', [authenticateEditorToken, ValidateCheckIn], async (req, res) => {
    let { amount, taskId } = req.body;
    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    if (task.status !== 1) {
        return res.status(403).json({
            msg: `Can not change amount of image when task status different from 1`
        })
    }

    let editor = task.editor.filter(x => x.staff == req.user._id);
    editor[(editor.length - 1)].submited[editor[(editor.length - 1)].submited.length - 1].amount = amount;
    await task.save()
        .then(t => {
            return res.status(200).json({
                msg: `Task has been changed amount successfully!`
            })
        })
        .catch(err => {
            msg: `Can not change image amount with error: ${new Error(err.message)}`
        })


})





router.put('/get-more', [authenticateEditorToken, ValidateCheckIn], async (req, res) => {
    //----------TÁC VỤ NHẬN task MỚI ---------------//
    /*
      Tại một thời điểm, editor có thể nhận tối đa 2 job ( không tính số lượng task)
      Muốn nhận task của job thứ 3 thì phải đợi tất cả task của những job trước đó được Q.A submit (Q.A ok)
    
    */

    let count = await Task.countDocuments({
        'editor.staff': req.user._id,
        'editor.visible': true,
        status: { $lte: 0, $ne:-10 }
    })

    if(count>0){
        return res.status(403).json({
            msg:`You can not get more task until your current tasks have been submited!`
        })
    }
    getTask(req.user._id)
        .then(async rs => {            
            let task = rs.task;
            task.status = 0;
            task.editor.push({
                staff: req.user._id,
                timestamp: new Date(),
                wage: rs.wage
            })
            await task.save()
                .then(async t => {
                    return res.status(200).json({
                        msg: `You have gotten more task successfully!`,
                        newTask: t._id
                    })
                })
                .catch(err => {
                    console.log(`Get more task failed with error: ${new Error(err.message)}`)
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



module.exports = router;




