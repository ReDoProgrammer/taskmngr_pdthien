const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Task = require('../../models/task-model');
const CustomerLevel = require('../../models/customer-level-model');
const Job = require('../../models/job-model');

const {
    getTaskDetail,
    getCustomer,
    getModule,
    getWage } = require('../common');


const _EDITOR = 'EDITOR';
const _QA = 'QA';

router.get('/list', authenticateTLAToken, (req, res) => {
    let { jobId } = req.query;
    Task
        .find({ job: jobId })
        .populate('level', 'name')
        .populate('qa', 'fullname -_id')
        .populate('editor', 'fullname -_id')
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

router.get('/all', authenticateTLAToken, (req, res) => {
    let { page, search, status } = req.query;
    if (status == 100) {
        Task
            .find(
                {
                    // $or: [
                    //     { firstname: { "$regex": search, "$options": "i" } },
                    // ]
                }
            )
            .populate('level')
            .populate('job')
            .populate('qa', 'fullname -_id')
            .populate('editor', 'fullname -_id')
            .exec()
            .then(tasks => {
                return res.status(200).json({
                    msg: 'Load tasks list successfully!',
                    tasks
                })
            })
            .catch(err => {
                return res.status(500).json({
                    msg: `Can not load taks list with error: ${new Error(err.message)}`
                })
            })
    } else {
        Task
            .find(
                {
                    status
                    // $or: [
                    //     { firstname: { "$regex": search, "$options": "i" } },
                    // ]
                }
            )
            .populate('level')
            .populate('job')
            .populate('qa', 'fullname -_id')
            .populate('editor', 'fullname -_id')
            .exec()
            .then(tasks => {
                return res.status(200).json({
                    msg: 'Load tasks list successfully!',
                    tasks
                })
            })
            .catch(err => {
                return res.status(500).json({
                    msg: `Can not load taks list with error: ${new Error(err.message)}`
                })
            })
    }


})

router.get('/detail', authenticateTLAToken, (req, res) => {
    let { taskId } = req.query;
    getTaskDetail(taskId)
        .then(async task => {
            await getCustomer(task.job.customer)
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




router.post('/', authenticateTLAToken, (req, res) => {
    let {
        job,
        level,
        assigned_date,
        deadline,
        input_link,
        remark,
        qa_assigned,
        qa,
        editor_assigned,
        editor
    } = req.body;

    Job
        .findById(job)
        .exec()
        .then(j => {

            if (new Date(deadline) > j.delivery_date) {
                return res.status(403).json({
                    msg: `Staff's deadline can not be later than job's deadline!`
                })
            }

            getCustomerIdFromJob(job)
                .then(result => {

                    getCustomerLevelPrice(result.customerId, level)
                        .then(async result => {

                            if (result.cl.price == 0) {
                                return res.status(403).json({
                                    msg: `Customer level price unit not available!`
                                })
                            }

                            let task = new Task();
                            task.created_by = req.user._id;
                            task.job = job;
                            task.level = level;
                            task.remark = remark;
                            task.level_price = result.cl.price;
                            task.assigned_date = assigned_date;
                            task.deadline = deadline;
                            task.input_link = input_link;


                            //thiết lập các thông tin liên quan khi Editor đc gán
                            if (editor_assigned == 'true') {
                                await getModule(_EDITOR)
                                .then(async m=>{
                                    await getWage(editor,level,m._id)
                                    .then(async w=>{
                                        task.editor_assigned = true;
                                        task.editor = editor;
                                        task.status = 0;
                                        task.editor_wage=w.wage;
                                        task.editor_assigned_date = new Date();
                                        task.editor_assigner = req.user._id;
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
                                
                            }

                            //thiết lập các thông tin khi Q.A được gán
                            if (qa_assigned == 'true') {
                                await getModule(_QA)
                                .then(async m=>{
                                    await getWage(qa,level,m._id)
                                    .then(async w=>{                                       
                                        task.qa_assigned = true;
                                        task.qa = qa;
                                        task.qa_wage=w.wage;
                                        task.qa_assigned_date = new Date();
                                        task.qa_assigner = req.user._id;
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
                              
                            }




                            task.save()
                                .then(_ => {
                                    return res.status(201).json({
                                        msg: `Task has been created`
                                    })
                                })
                                .catch(err => {
                                    return res.status(500).json({
                                        msg: `Can not create task with error: ${new Error(err.message)}`,
                                        error: new Error(err.message)
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
            return res.status(500).json({
                msg: `Can not get job by id with error: ${new Error(err.message)}`
            })
        })
})


router.put('/cancel', authenticateTLAToken, (req, res) => {
    let { taskId, canceled_reason, remark } = req.body;
    Task
        .findByIdAndUpdate(taskId, {
            status: -4,
            canceled_reason,
            remark,
            canceled_by: req.user._id,
            canceled_at: new Date()
        }, { new: true }, (err, task) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    msg: `Can not cancel task with error: ${new Error(err.message)}`
                })
            }

            if (!task) {
                return res.status(404).json({
                    msg: `Can not cancel task because it not found!`
                })
            }

            return res.status(200).json({
                msg: `The task has been canceled!`,
                task
            })
        })
})

router.put('/assign-editor', authenticateTLAToken, (req, res) => {
    let { editor, taskId } = req.body;
    getTaskDetail(taskId)
    .then(async t=>{
        await getModule(_EDITOR)
        .then(async m=>{
            await getWage(editor,t.level._id,m._id)
            .then(async w=>{
                console.log('wage ne: ',w);
                Task
                .findByIdAndUpdate(taskId,{
                    editor_assigned_date:new Date(),
                    status:0,
                    editor_assigned:true,
                    editor_wage:w.wage,
                    editor:editor,
                    editor_assigner:req.user._id
                },{new:true},(err,task)=>{
                    if(err){
                        return res.status(500).json({
                            msg:`Can not assign editor with error: ${new Error(err.message)}`
                        })
                    }

                    return res.status(200).json({
                        msg:`Assign editor into task successfully!`,
                        task
                    })
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
    .catch(err=>{
        return res.status(err.code).json({
            msg:err.msg
        })
    })
})

router.put('/assign-qa', authenticateTLAToken, (req, res) => {
    let { qa, taskId } = req.body;
    getTaskDetail(taskId)
    .then(async t=>{
        await getModule(_QA)
        .then(async m=>{
            await getWage(qa,t.level._id,m._id)
            .then(async w=>{
                Task
                .findByIdAndUpdate(taskId,{
                    qa_assigned_date:new Date(),
                    qa_assigned:true,
                    qa_wage:w.wage,
                    qa:qa,
                    qa_assigner:req.user._id
                },{new:true},(err,task)=>{
                    if(err){
                        return res.status(500).json({
                            msg:`Can not assign Q.A with error: ${new Error(err.message)}`
                        })
                    }

                    return res.status(200).json({
                        msg:`Assign Q.A into task successfully!`,
                        task
                    })
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
    .catch(err=>{
        return res.status(err.code).json({
            msg:err.msg
        })
    })
})

router.put('/', authenticateTLAToken, async (req, res) => {
    let {
        taskId,
        assigned_date,
        deadline,
        input_link,
        remark,
        qa_assigned,
        editor_assigned,
        qa,
        editor
    } = req.body;



    await Task.findByIdAndUpdate(taskId, {
        assigned_date,
        deadline,
        input_link,
        remark,
        qa_assigned,
        editor_assigned,
        qa: (qa_assigned == 'true' ? qa : null),
        editor: (editor_assigned == 'true' ? editor : null),
        status: (editor_assigned == 'true' ? 0 : -1),
        editor_assigned_date: new Date(),
        qa_assigned_date: new Date(),
        updated_by: req.user._id,
        updated_at: new Date()
    }, { new: true }, (err, task) => {
        if (err) {
            return res.status(500).json({
                msg: `Can not update task with caught error: ${new Error(err.message)}`
            })
        }
        if (!task) {
            return res.status(404).json({
                msg: `Task not found!`
            })
        }
        return res.status(200).json({
            msg: `The task has been updated!`,
            task
        })
    })

})



router.delete('/', authenticateTLAToken, (req, res) => {
    let { _id } = req.body;
    Task.findByIdAndDelete(_id)
        .exec()
        .then(_ => {
            return res.status(200).json({
                msg: 'Task has been deleted!'
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this task`,
                error: `Error found: ${new Error(err.message)}`
            })
        })
})


module.exports = router;



const getCustomerIdFromJob = (jobId) => {
    return new Promise((resolve, reject) => {
        Job
            .findById(jobId)
            .exec()
            .then(j => {
                if (!j) {
                    return reject({
                        code: 404,
                        msg: `Job not found`
                    })
                }
                return resolve({
                    code: 200,
                    msg: `Job found`,
                    customerId: j.customer
                })
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get job with error: ${new Error(err.message)}`
                })
            })
    })
}



const getCustomerLevelPrice = (customerId, levelId) => {
    return new Promise((resolve, reject) => {
        CustomerLevel.findOne({ customer: customerId, level: levelId })
            .exec()
            .then(cl => {
                if (!cl) {
                    return reject({
                        code: 404,
                        msg: `Customer level not found`
                    })
                }
                return resolve({
                    code: 200,
                    msg: `Customer level found`,
                    cl
                })
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Customer level can not found with error: ${new Error(err.message)}`
                })
            })
    })
}

