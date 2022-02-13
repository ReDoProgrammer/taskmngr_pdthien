const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Task = require('../../models/task-model');
const CustomerLevel = require('../../models/customer-level-model');
const Wage = require('../../models/wage-model');
const Job = require('../../models/job-model');
const User = require('../../models/user-model');

const _EDITOR = 'EDITOR';
const _QA = 'QA';

const Module = require('../../models/module-model');


router.get('/list', authenticateTLAToken, (req, res) => {
    let { jobId } = req.query;
    Task
        .find({ job: jobId })
        .populate('level', 'name -_id')
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
    let { job, level, remark } = req.body;

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
                        level_price: result.cl.price
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

router.put('/assign-editor', authenticateTLAToken, (req, res) => {

    let { taskId, staff } = req.body;
    getModule(_EDITOR)
        .then(result => {
            
            getWage(staff,result.m._id)
                .then(result => {
                    console.log(result);
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



    // Task.findById(taskId)
    //     .exec()
    //     .then(t => {
    //         Task.findByIdAndUpdate(taskId,
    //             {
    //                 editor: staff,
    //                 editor_assigned: true
    //             }, { new: true }, (err, task) => {
    //                 if (err) {
    //                     return res.status(500).json({
    //                         msg: `Assigned staff failed with error: ${new Error(err.message)}`
    //                     })
    //                 }
    //                 if (task == null) {
    //                     return res.status(404).json({
    //                         msg: `Task not found`
    //                     })
    //                 }

    //                 return res.status(200).json({
    //                     msg: `Staff has been assigned successfully!`
    //                 })
    //             })
    //     })
    //     .catch(err => {
    //         return res.status(500).json({
    //             msg: `Can not find task by id ${new Error(err.mesaage)}`
    //         })
    //     })



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

const getModule = (moduleName) => {
    return new Promise((resolve, reject) => {
        Module
            .findOne({ name: moduleName })
            .exec()
            .then(m => {
                if (!m) {
                    return reject({
                        code: 404,
                        msg: `Module not found`
                    })
                }
                return resolve({
                    code: 200,
                    msg: `Get module info successfully!`,
                    m
                })
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get module with error: ${new Error(err.message)}`
                })
            })
    })
}

const getWage = (staffId, moduleId) => {
    return new Promise((resolve, reject) => {
        User
            .findById(staffId)
            .exec()
            .then(u => {
                if (!u) {
                    return reject({
                        code: 404,
                        msg: `Staff not found!`
                    })
                }
                Wage
                    .find({ user_group: u.user_type })
                    .exec()
                    .then(w => {
                        return resolve({
                            code: 200,
                            msg: `Wage found`,
                            w
                        })
                    })
                    .catch(err => {
                        return reject({
                            code: 500,
                            msg: `Can not get wage with error: ${new Error(err.message)}`
                        })
                    })

            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get staff with error: ${new Error(err.message)}`
                })
            })
    })
}


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

