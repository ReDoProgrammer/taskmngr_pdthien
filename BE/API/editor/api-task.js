const router = require("express").Router();
const Task = require("../../models/task-model");
const Customer = require('../../models/customer-model');
const StaffJobLevel = require('../../models/staff-job-level-model');
const { 
    getUser,
    getCustomer,
    getTaskDetail } = require('../common');

var ObjectId = require('mongodb').ObjectId;

const { authenticateEditorToken } = require("../../../middlewares/editor-middleware");

const _MODULE = 'EDITOR';


router.post('/change-amount', authenticateEditorToken, async (req, res) => {
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
        .find({ 'editor.staff': req.user._id })//chỉ load những task đã được TLA gán hoặc editor đã nhận được        
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
            return res.status(200).json({
                msg: `Load your tasks list successfully!`,
                tasks
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
                    console.log(task)
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
       Đăng ký nhận task miễn phù hợp và những task đó không vượt quá 2 job
    
    */
    GetProcessingJobs(req.user._id)//lấy những job mà editor này đang xử lý, chưa submit
        .then(jobIds => {
            if (jobIds.length > 0) {
                getUser(req.user._id)           
                .then(u=>{                  
                    GetJobLevelsByStaffLevel(u.user_level._id)
                    .then(levels=>{
                        let jobLv = levels.map(x=>{
                            return x.job_lv
                        });
                        GetInititalTasks(jobIds,jobLv)
                        .then(tasks=>{
                            if(tasks.length>0){
                                let task = tasks[0];
                            }
                        })
                        .catch(err=>{
                            return res.status(err.code).json({
                                msg:err.msg
                            })
                        })
                    })
                    .catch(err=>{
                        console.log(err)
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
            }

        })
        .catch(err => {
            console.log(err)
            return res.status(err.code).json({
                msg: err.msg
            })
        })



})



module.exports = router;

//lấy những job level mà trình độ nhân viên có thể đảm nhận
const GetJobLevelsByStaffLevel = (staffLevel)=>{
    return new Promise((resolve,reject)=>{
        StaffJobLevel
        .find({staff_lv:staffLevel})
        .then(levels=>{
            return resolve(levels)
        })
        .catch(err=>{
            return reject({
                code:500,
                msg:`Can not get job levels by staff level with error: ${new Error(err.message)}`
            })
        })
    })
}


//lấy những task chưa có editor nào xử lý
const GetInititalTasks = (jobIds,jobLevelIds)=>{
    return new Promise((resolve,reject)=>{
        Task
                //lấy những task chưa có editor nào nhận
                    .find({
                        'basic.job': { $in: jobIds },
                        'basic.level':{$in:jobLevelIds},
                        editor:{$size:0},
                        status:-1
                    })
                    .sort({'basic.deadline.end':1})// sắp xếp tăng dần theo deadline
                    .then(tasks => {
                        return resolve(tasks)
                    })
                    .catch(err => {
                       return reject({
                           code:500,
                           msg:`Can not get initial task in jobs list with error: ${new Error(err.message)}`
                       })
                    })
    })
}


//lấy những job mà editor đăng nhập đang xử lý
const GetProcessingJobs = (staffId) => {
    return new Promise((resolve, reject) => {
        Task
            .aggregate([
                {
                    $match: {
                        'editor.staff': ObjectId(staffId),
                        status: 0
                    }
                },
                { $group: { _id: '$basic.job' } }
            ])
            .then(jobs => {
                return resolve(jobs)
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get jobs list wich you are processing with error: ${new Error(err.message)}`
                })
            })
    })
}



