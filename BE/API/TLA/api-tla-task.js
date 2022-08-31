const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const CC = require('../../models/cc-model');
const Task = require('../../models/task-model');
const Job = require('../../models/job-model');
const JobLine = require('../../models/job-line-model');

const {
    getWage,
    GetTask,
    GetCustomerById
} = require('../common');
const { log } = require('npm');


const _EDITOR = 'EDITOR';
const _QA = 'QA';

const pageSize = 20;

router.get('/list-available-tasks',authenticateTLAToken,async (req,res)=>{
    let {jobId}  = req.query;
    
    let jobLine = await JobLine.find({job:jobId})
    .populate([
        {path:'level',select:'name'},
        {path:'tasks'}
    ])
    ;
   

   console.log(jobLine)
})

router.get('/list-based-on-root', authenticateTLAToken, async (req, res) => {
    let { jobId, rootId, is_root } = req.query;
    let job = await Job.findById(jobId);
    let taskIds = [];
    if (is_root == 1) {
        let root = (job.root.filter(x => x.ref == rootId))[0];
        taskIds = root.tasks;
    } else {
        let parents = (job.parents.filter(x => x.ref == rootId))[0];
        taskIds = parents.tasks;
    }
    let tasks = await Task.find({
        'basic.job': jobId,
        _id: { $in: taskIds },
        // status: 3
    }).populate('basic.level');



    return res.status(200).json({
        msg: `List tasks based on root and job successfully!`,
        tasks
    })

})

router.get('/list', authenticateTLAToken, async (req, res) => {
    let { jobId } = req.query;
    let job = await Job.findById(jobId);
    if (!job) {
        return res.status(404).json({
            msg: `Job not found!`
        })
    }

    let tasks = await Task.find({ 'basic.job': jobId })
        .populate([
            { path: 'basic.job', select: 'name urgent' },
            { path: 'basic.level', select: 'name' },
            { path: 'editor.staff', select: 'fullname username' },
            { path: 'qa.staff', select: 'fullname username' },
            { path: 'dc.staff' },
            { path: 'basic.mapping' }
        ]);

    return res.status(200).json({
        msg: `Load tasks based on job successfully!`,
        tasks
    })
})

router.get('/all', authenticateTLAToken, async (req, res) => {
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
            { path: 'basic.level', select: 'name' },
            { path: 'basic.mapping', select: 'name' },
            { path: 'editor.staff', select: 'username fullname' },
            { path: 'qa.staff', select: 'username fullname' },
            { path: 'dc.staff', select: 'username fullname' },
            { path: 'remarks' },
            { path: 'bp.bpId', select: 'is_bonus' },
            { path: 'canceled.reason', select: 'name' }
        ]);

    let count = await Task.countDocuments({});

    return res.status(200).json({
        msg: `Load tasks list successfully!`,
        tasks,
        pageSize,
        pages: count % pageSize == 0 ? count / pageSize : Math.floor(count / pageSize) + 1
    })

})

router.get('/list-uploaded', authenticateTLAToken, (req, res) => {
    let { jobId } = req.query;

    Task
        .find({
            'basic.job': jobId,
            status: { $gt: 3 }// lấy các task có trạng thái đã được upload trở lên
        })
        .populate([

            {
                path: 'basic.level',
                select: 'name'
            },
            {
                path: 'tla.uploaded.by',
                select: 'fullname'
            },
            {
                path: 'remarks',
                select: 'content'
            }

        ])
        .exec()
        .then(tasks => {
            return res.status(200).json({
                msg: `Load uploaded tasks list successfully!`,
                tasks
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not list uploaded tasks list with error: ${new Error(err.message)}`
            })
        })
})

router.get('/list-unuploaded', authenticateTLAToken, (req, res) => {
    let { jobId } = req.query;
    Task
        .find({
            'basic.job': jobId,
            status: 3//chỉ lấy những task đã được DC submit: status = 3
        })
        .populate([

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
            }

        ])

        .exec()
        .then(tasks => {
            return res.status(200).json({
                msg: `Load unuploaded tasks successfully!`,
                tasks
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not list unuploaded tasks with error: ${new Error(err.message)}`
            })
        })
})


router.get('/detail', authenticateTLAToken, async (req, res) => {
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






router.post('/', authenticateTLAToken, async (req, res) => {
    let {
        jobId,
        customer_level,
        price,
        level,
        assigned_date,
        deadline,
        input_link,
        remark,
        qa,
        editor,
        start,
        ccId
    } = req.body;


    let task = new Task();
    task.basic = {
        job: jobId,
        level,
        mapping: customer_level,
        deadline: {
            begin: assigned_date,
            end: deadline
        },
        link: {
            input: input_link
        }
    }


    task.status = start == 'true' ? (editor ? 0 : -1) : -10;


    task.tla = {
        created: {
            by: req.user._id
        }
    };

    if (ccId.length > 0) {
        task.cc = ccId;
    }


    task.remarks = [
        {
            content: remark,
            created: {
                at: new Date(),
                by: req.user._id
            }
        }
    ]


    // CreateOrUpdateTask( jobId,customer_level,level,assigned_date,deadline,input_link,remark,editor,start,cc,task,task,req.user._id,true)
    await task.save()
        .then(async _ => {
            Promise.all([PushTaskIntoJobLine(jobId, task._id, customer_level, price), UpdateEditor(task._id, level, editor, req.user._id), PushTaskIntoCC(ccId, task._id, customer_level)])
                .then(_async => {
                    UpdateQA(task._id, level, qa, req.user._id)
                        .then(_ => {
                            return res.status(201).json({
                                msg: `Task has been created!`
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
                msg: `Can not add new task with error: ${new Error(err.message)}`
            })
        })
})



router.put('/upload', authenticateTLAToken, async (req, res) => {
    let { taskId, uploaded_link, remark } = req.body;
    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    task.remarks.push({
        content: remark,
        created: {
            at: new Date(),
            by: req.user._id
        }
    })
    task.status = 4;

    task.tla.uploaded.push({
        at: new Date(),
        by: req.user._id,
        link: uploaded_link
    });

    await task.save()
        .then(_ => {
            return res.status(200).json({
                msg: `The task has been uploaded!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not upload this task with error: ${new Error(err.message)}`
            })
        })
})

router.put('/cancel', authenticateTLAToken, async (req, res) => {
    let { taskId, reason, penalty, fines, remark } = req.body;
    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    task.canceled = {
        reason,
        penalty,
        fines,
        at: new Date(),
        by: req.user._id
    };

    task.remarks.push({
        content: remark,
        created: {
            by: req.user._id,
            at: new Date()
        }
    })

    task.status = -5;//trang thai task bi TLA cancel

    await task.save()
        .then(_ => {
            return res.status(200).json({
                msg: `The task has been canceled!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not cancel this task with caught error: ${new Error(err.message)}`
            })
        })

})


router.put('/', authenticateTLAToken, async (req, res) => {
    let {
        taskId,
        level,
        assigned_date,
        deadline,
        input_link,
        remark,
        qa,
        editor,
        start
    } = req.body;

    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            msg: `Can not update task because it\'s not found!`
        })
    }
    task.basic.level = level;
    task.basic.deadline = {
        begin: assigned_date,
        end: deadline
    };
    task.basic.link.input = input_link;

    task.status = start == 'true' ? (editor ? task.status : -1) : -10;

    if (task.remarks[task.remarks.length - 1].content !== remark) {
        task.remarks.push({
            content: remark,
            created: {
                at: new Date(),
                by: req.user._id
            }
        })
    }

    task.updated = {
        at: new Date(),
        by: req.user._id
    }

    await task.save()
        .then(_ => {
            ChangeVisibleEditor(task._id, editor)
                .then(_ => {
                    ChangeVisibleQA(task._id, qa)
                        .then(_ => {
                            UpdateEditor(task._id, level, editor, req.user._id)
                                .then(_ => {
                                    UpdateQA(task._id, level, qa, req.user._id)
                                        .then(_ => {
                                            return res.status(200).json({
                                                msg: `The task has been updated!`
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
                msg: `Can not update task with error: ${new Error(err.message)}`
            })
        })

})



router.delete('/', authenticateTLAToken, async (req, res) => {
    let { taskId } = req.body;

    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    if (task.status > 0) {
        return res.status(409).json({
            msg: `Can not delete task after submiting!`
        })
    }
    await task.delete()
        .then(_ => {
            Promise.all[PullTaskFromJob(task.basic.job, task.basic.mapping, task._id), PullTaskFromCC(task.cc, task._id)]
                .then(_ => {
                    return res.status(200).json({
                        msg: `The task has been deleted!`
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
                msg: `Can not delete this task with error: ${new Error(err.message)}`
            })
        })

})


module.exports = router;

const PushJobLineIntoJob = (jobId, jobLineId) => {
    return new Promise(async (resolve, reject) => {
        let job = await Job.findById(jobId);
        if (!job) {
            return reject({
                code: 404,
                msg: `Can not push job line into job when job not found!`
            })
        }

        if (job.job_lines.includes(jobLineId)) {
            return resolve();
        } else {
            job.job_lines.push(jobLineId);
            await job.save()
                .then(_ => { return resolve() })
                .catch(err => {
                    return reject({
                        code: 500,
                        msg: `Can not push job line into job with error: ${new Error(err.message)}`
                    })
                })
        }
    })
}

const PullJobLineFromJob = (jobId, jobLineId) => {
    return new Promise(async (resolve, reject) => {
        let job = await Job.findById(jobId);
        if (!job) {
            return reject({
                code: 404,
                msg: `Can not pull job line from job cause job not found!`
            })
        }

        job.job_lines.pull(jobLineId);

        await job.save()
            .then(_ => { return resolve() })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not remove job line out of job with error: ${new Error(err.message)}`
                })
            })
    })
}

const PushTaskIntoJobLine = (jobId, taskId, customer_job_level, price) => {
    return new Promise(async (resolve, reject) => {
        let jl = await JobLine.findOne({ job: jobId, level: customer_job_level });
        if (!jl) {
            jl = new JobLine({
                job: jobId,
                level: customer_job_level,
                price,
                tasks: [taskId]
            })
        } else {
            jl.tasks.push(taskId);
        }
        await jl.save()
            .then(_ => {
                PushJobLineIntoJob(jobId, jl._id)
                    .then(_ => {
                        return resolve();
                    })
                    .catch(err => {
                        return reject(err);
                    })

            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not push task into job with error: ${new Error(err.message)}`
                })
            })
    })
}

const PullTaskFromJob = (jobId, level, taskId) => {
    return new Promise(async (resolve, reject) => {
        let jl = await JobLine.findOne({ job: jobId, level });
        if (!jl) {
            return reject({
                code: 404,
                msg: `Job line not found!`
            })
        }

        jl.tasks.pull(taskId);
        if (jl.tasks.length == 0) {
            await jl.delete()
                .then(_ => {
                    PullJobLineFromJob(jobId, jl)
                        .then(_ => { return resolve(); })
                        .catch(err => { return reject(err) })
                })
                .catch(err => {
                    return reject({
                        code: 500,
                        msg: `Can not delete job line when tasks list is empty with error: ${new Error(err.message)}`
                    })
                })
        } else {
            await jl.save()
                .then(_ => { return resolve() })
                .catch(err => {
                    return reject({
                        code: 500,
                        msg: `Can not remove task out of job with error: ${new Error(err.message)}`
                    })
                })
        }



    })
}

const UpdateEditor = (taskId, level, editor, tla) => {
    return new Promise(async (resolve, reject) => {
        let task = await Task.findById(taskId);
        if (!task) {
            return reject({
                code: 404,
                msg: `Can not change editor when task not found!`
            })
        }

        if (!editor) {
            task.editor = [];
            await task.save()
                .then(_ => {
                    return resolve(task);
                })
                .catch(err => {
                    console.log(`Can not reset editor list with error: ${new Error(err.message)}`)
                    return reject({
                        code: 500,
                        msg: `Can not reset editor list with error: ${new Error(err.message)}`
                    })
                })
        } else {
            if (task.editor.length == 0 || (task.editor.length > 0 && task.editor[task.editor.length - 1].staff != editor)) {
                getWage(editor, _EDITOR, level)
                    .then(async wage => {
                        task.editor.push({
                            staff: editor,
                            wage,
                            tla,
                        })

                        await task.save()
                            .then(_ => {
                                return resolve(task)
                            })
                            .catch(err => {
                                return reject({
                                    code: 500,
                                    msg: `Can not change task editor with error: ${new Error(err.message)}`
                                })
                            })

                    })
                    .catch(err => {
                        return reject(err);
                    })
            } else {
                return resolve(task);
            }
        }

    })
}

const UpdateQA = (taskId, level, qa, tla) => {
    return new Promise(async (resolve, reject) => {
        let task = await Task.findById(taskId);
        if (!task) {
            return reject({
                code: 404,
                msg: `Can not change Q.A when task not found!`
            })
        }

        if (!qa) {
            task.qa = [];
            await task.save()
                .then(_ => {
                    return resolve(task);
                })
                .catch(err => {
                    console.log(`Can not reset Q.A list with error: ${new Error(err.message)}`)
                    return reject({
                        code: 500,
                        msg: `Can not reset Q.A list with error: ${new Error(err.message)}`
                    })
                })
        } else {
            if (task.qa.length == 0 || (task.qa.length > 0 && task.qa[task.qa.length - 1].staff != qa)) {
                getWage(qa, _QA, level)
                    .then(async wage => {
                        task.qa.push({
                            staff: qa,
                            wage,
                            tla,
                            timestamp: new Date()
                        })

                        await task.save()
                            .then(_ => {
                                return resolve(task)
                            })
                            .catch(err => {
                                return reject({
                                    code: 500,
                                    msg: `Can not change task Q.A with error: ${new Error(err.message)}`
                                })
                            })

                    })
                    .catch(err => {
                        return reject(err);
                    })
            } else {
                return resolve(task);
            }
        }

    })
}



const ChangeVisibleEditor = (taskId, editor) => {
    return new Promise(async (resolve, reject) => {
        if (!editor) {
            return resolve();
        }

        let task = await Task.findById(taskId);

        if (task.editor.length == 0) {
            return resolve();
        }

        if (task.editor[task.editor.length - 1].staff == editor) {
            return resolve();
        }

        task.editor[task.editor.length - 1].visible = false;
        await task.save()
            .then(_ => {
                return resolve(task);
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not update visible other Editor with error: ${new Error(err.message)}`
                })
            })
    })
}

const ChangeVisibleQA = (taskId, qa) => {
    return new Promise(async (resolve, reject) => {
        if (!qa) {
            return resolve();
        }
        let task = await Task.findById(taskId);
        if (task.qa.length == 0) {
            return resolve();
        }
        if (task.qa[task.qa.length - 1].staff == qa) {
            return resolve();
        }
        task.qa[task.qa.length - 1].visible = false;
        await task.save()
            .then(_ => {
                return resolve(task);
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not update visible other Q.A with error: ${new Error(err.message)}`
                })
            })
    })
}

const PushTaskIntoCC = (ccId, taskId, rootId) => {
    return new Promise(async (resolve, reject) => {
        if (ccId.length == 0) {
            return resolve();
        }

        let cc = await CC.findById(ccId);
        if (!cc) {
            return reject({
                code: 404,
                msg: `Can not push task into not found CC!`
            })
        }

        if (!cc.root && rootId) {
            cc.root = rootId;
        }



        cc.tasks.push(taskId);
        if (cc.status == -1) {
            cc.status = 0;
        }
        await cc.save()
            .then(_ => { return resolve() })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not push task into CC with caught error: ${new Error(err.message)}`
                })
            })


    })
}

const PullTaskFromCC = (ccId, taskId) => {
    return new Promise(async (resolve, reject) => {
        if (!ccId) {
            return resolve();
        }
        let cc = await CC.findById(ccId);
        if (!cc) {
            return reject({
                code: 404,
                msg: `Can not remove the task out of not found CC!`
            })

            cc.tasks.pull(taskId);
            if (cc.tasks.length == 0) {
                cc.status = -1;
            }
            await cc.save()
                .then(_ => { return resolve() })
                .catch(err => {
                    return reject({
                        code: 500,
                        msg: `Can not remove the task out of CC with caught error: ${new Error(err.message)}`
                    })
                })
        }
    })
}

