const router = require("express").Router();
const Task = require("../../models/task-model");
const CheckIn = require('../../models/staff-checkin');

const {
    getCustomer,
    getUser,
    getTaskDetail } = require('../common');



const { getTask } = require('./get-task')

const { authenticateEditorToken } = require("../../../middlewares/editor-middleware");


router.put('/reject',authenticateEditorToken,async (req,res)=>{
    let {taskId,remark} = req.body;
    let task = await Task.findById(taskId);
    if(!task){
        return res.status(404).json({
            msg:`Task not found!`
        })
    }

    task.status = -1;

    let rm = new Remark({
        tid:task._id,
        content:remark,
        user:req.user._id
    });
    await rm.save()
    .then(async _=>{
        task.remarks.push(rm);
        task.editor[task.editor.length-1].rejected.push({
            at:new Date(),
            reason:rm._id
        });
        await task.save()
        .then(_=>{
            return res.status(200).json({
                msg:`You have rejected task successfully!`
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`You can not reject this task with error: ${new Error(err.message)}`
            })
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not set remark into this task with error: ${new Error(err.message)}`
        })
    })

    
})

router.put('/change-amount', authenticateEditorToken, async (req, res) => {
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




router.get('/', authenticateEditorToken, (req, res) => {
    let { page, search, status } = req.query;
    Task
        .find({ 
            'editor.staff': req.user._id,
            // status: {$gt:-1}
        })//chỉ load những task đã được TLA gán hoặc editor đã nhận được        
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
        .sort({ 'editor.timestamp': -1 })//sắp xếp giảm dần thời gian đăng ký của editor
        .sort({ status: 1 })//sắp xếp tăng dần theo trạng thái của task

        .exec()
        .then(tasks => {
            var rs = tasks.slice((page-1)*10,10);           
            var pages = tasks.length%10==0?tasks.length/10:Math.floor(tasks.length/10)+1;           
          
            return res.status(200).json({
                msg: `Load your tasks list successfully!`,
                tasks: rs,
                pages
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load your tasks list with error: ${new Error(err.message)}`
            })
        })
})


router.get('/detail', authenticateEditorToken, (req, res) => {
    let { taskId } = req.query;


    getTaskDetail(taskId)
        .then(async task => {

            await getCustomer(task.basic.job.customer)
                .then(customer => {
                    return res.status(200).json({
                        msg: `Load task detail successfully!`,
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


router.put('/submit', authenticateEditorToken, async (req, res) => {
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






router.put('/get-more', authenticateEditorToken, async (req, res) => {
    //----------TÁC VỤ NHẬN task MỚI ---------------//
    /*
      Tại một thời điểm, editor có thể nhận tối đa 2 job ( không tính số lượng task)
      Muốn nhận task của job thứ 3 thì phải đợi tất cả task của những job trước đó được Q.A submit (Q.A ok)
    
    */

    CheckIn
        .findOne({ staff: req.user._id })
        .then(chk => {
            if (!chk) {
                return res.status(404).json({
                    msg: `Staff check in not found!`
                })
            }

            if (chk.check[chk.check.length - 1].out == undefined) {

                Task
                .countDocuments({
                    'editor.staff':req.user._id,
                    status: {$lte:0}
                })
                .then(c=>{
                    console.log({c})
                    if(c>0){
                        return res.status(403).json({
                            msg:`You can not get more task before submiting current tasks!`
                        })
                    }else{
                        getTask(req.user._id)
                        .then(async rs => {
                            let task = rs.task;
                            task.status = 0;
                            task.editor.push({
                                staff: req.user._id,
                                timestamp: new Date(),
                                wage: rs.wage.wage
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
                    }
                })
                .catch(err=>{
                    console.log(`Can not count current processing tasks with error: ${new Error(err.message)}`)
                    return res.status(500).json({
                        msg:`Can not count current processing tasks with error: ${new Error(err.message)}`
                    })
                })

               
            } else {
                console.log(`You can not get more task when you are not in office!`)
                return res.status(403).json({
                    msg: `You can not get more task when you are not in office!`
                })
            }
        })
        .catch(err => {
            console.log(`Can not load staff checkin with error: ${new Error(err.message)}`)
            return res.status(500).json({
                msg: `Can not load staff checkin with error: ${new Error(err.message)}`
            })
        })
})



module.exports = router;




