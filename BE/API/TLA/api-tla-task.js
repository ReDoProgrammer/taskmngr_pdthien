const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Task = require('../../models/task-model');
const CustomerLevel = require('../../models/customer-level-model');
const Job = require('../../models/job-model');
const {getModule,
    getUser,
    getWage} = require('../common');


const _EDITOR = 'EDITOR';
const _QA = 'QA';


router.get('/list', authenticateTLAToken, (req, res) => {
    let { jobId } = req.query;
    Task
        .find({ job: jobId })
        .populate('level', 'name')
        // .populate('job')
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

router.get('/', authenticateTLAToken, (req, res) => {
    let { page, search } = req.query;
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

})

router.get('/detail', authenticateTLAToken, (req, res) => {

})

router.post('/', authenticateTLAToken, (req, res) => {
    let { job, level, assigned_date, deadline,input_link, remark } = req.body;

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
                        .then(result => {

                            if (result.cl.price == 0) {
                                return res.status(403).json({
                                    msg: `Customer level price unit not available!`
                                })
                            }

                            let task = new Task({
                                job,
                                level,
                                remark,
                                level_price: result.cl.price,
                                assigned_date,
                                deadline,
                                input_link
                            });

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

router.put('/assign-editor', authenticateTLAToken, (req, res) => {

    let { taskId, levelId, staff } = req.body;
    getModule(_EDITOR)
        .then(result => {

            getWage(staff, levelId, result.m._id)
                .then(result => {                    
                    Task.findByIdAndUpdate(taskId,
                        {
                            editor: staff,
                            editor_assigned: true,
                            editor_wage: result.w.wage,
                            status:0 //task có trạng thái đang được editor xử lý

                        }, { new: true }, (err, task) => {
                            if (err) {
                                return res.status(500).json({
                                    msg: `Assigned staff failed with error: ${new Error(err.message)}`
                                })
                            }
                            if (task == null) {
                                return res.status(404).json({
                                    msg: `Task not found`
                                })
                            }

                            return res.status(200).json({
                                msg: `Staff has been assigned successfully!`
                            })
                        })
                })
                .catch(err => {
                    console.log(err.msg);
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

router.put('/assign-qa', authenticateTLAToken, (req, res) => {

    let { taskId, levelId, staff } = req.body;
    getModule(_QA)
        .then(result => {

            getWage(staff, levelId, result.m._id)
                .then(result => {                    
                    Task.findByIdAndUpdate(taskId,
                        {
                            qa: staff,
                            qa_assigned: true,
                            qa_wage: result.w.wage,
                            status:0 //task có trạng thái đang được qa xử lý

                        }, { new: true }, (err, task) => {
                            if (err) {
                                return res.status(500).json({
                                    msg: `Assigned staff failed with error: ${new Error(err.message)}`
                                })
                            }
                            if (task == null) {
                                return res.status(404).json({
                                    msg: `Task not found`
                                })
                            }

                            return res.status(200).json({
                                msg: `Staff has been assigned successfully!`
                            })
                        })
                })
                .catch(err => {
                    console.log(err.msg);
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

