const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Task = require('../../models/task-model');
const Job = require('../../models/job-model');


const {
    getWage,
    GetTask,
    GetCustomerById } = require('../common');
const { log } = require('npm');


const _EDITOR = 'EDITOR';
const _QA = 'QA';

const pageSize = 20;

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
        _id: { $in: taskIds }
    }).populate('basic.level');

    let levels = tasks.map(x => {
        return x.basic.level;
    })
    return res.status(200).json({
        msg: `List tasks based on root and job successfully!`,
        levels
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
            { path: 'dc.staff' }
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
            { path: 'editor.staff', select: 'username fullname' },
            { path: 'qa.staff', select: 'username fullname' },
            { path: 'dc.staff', select: 'username fullname' },
            { path: 'remarks' },
            { path: 'bp.bpId', select: 'is_bonus' }
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
        is_root,
        level,
        assigned_date,
        deadline,
        input_link,
        remark,
        qa,
        editor,
        start,
        cc
    } = req.body;

    let task = new Task();

    task.basic = {
        job: jobId,
        level,
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

    task.remarks = [
        {
            content: remark,
            created: {
                at: new Date(),
                by: req.user._id
            }
        }
    ]

    await task.save()
        .then(async _ => {
            Promise.all([PushTaskIntoJob(jobId, task._id, customer_level, is_root), UpdateEditor(task._id, level, editor, req.user._id), PushCC(jobId, cc, task._id, customer_level, is_root)])
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
    let { _id } = req.body;

    //Bước 1: kiểm tra task có tồn tại hay không
    let task = await Task.findById(_id);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }


    await task.delete()
        .then(_ => {
            Promise.all([PullTaskFromJob(task.basic.job, task._id), PullTaskFromCC(task.basic.job, task._id)])
                .then(_ => {
                    return res.status(200).json({
                        msg: `Task has been deleted!`
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

const PushTaskIntoJob = (jobId, taskId, customer_job_level, is_root) => {
    return new Promise(async (resolve, reject) => {
        let job = await Job.findById(jobId);
        if (!job) {
            return reject({
                code: 404,
                msg: `Job not found!`
            })
        }

        if (is_root == 'true') {
            let chk = job.root.filter(x => x.ref == customer_job_level);
            if (chk.length > 0) {
                chk[0].tasks.push(taskId);
            } else {
                job.root.push({
                    ref: customer_job_level,
                    tasks: [taskId]
                });
            }
        } else {
            let chk = job.parents.filter(x => x.ref == customer_job_level);
            if (chk.length > 0) {
                chk[0].tasks.push(taskId);
            } else {
                job.parents.push({
                    ref: customer_job_level,
                    tasks: [taskId]
                });
            }
        }

        await job.save()
            .then(_ => {
                return resolve(job);
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not add task into job with error: ${new Error(err.message)}`
                })
            })
    })
}

const PullTaskFromJob = (jobId, taskId) => {
    return new Promise(async (resolve, reject) => {
        let job = await Job.findById(jobId);
        if (!job) {
            return reject({
                code: 404,
                msg: `Job not found!`
            })
        }

        job.root.forEach(r => {
            r.tasks = r.tasks.filter(x => x != taskId.toString());
            if (r.tasks.length == 0) {
                job.root = job.root.filter(x => x != r);
            }
        });
        job.parents.forEach(p => {
            p.tasks = p.tasks.filter(x => x != taskId.toString());
            if (p.tasks.length == 0) {
                job.parents = job.parents.filter(x => x != p);
            }
        });

        await job.save()
            .then(_ => {
                return resolve(job);
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not remove task from job with error: ${new Error(err.message)}`
                })
            })
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

const PushCC = (jobId, ccId, taskId, rootId, is_root) => {
    return new Promise(async (resolve, reject) => {
        if (!ccId) {
            return resolve();
        }

        let job = await Job.findById(jobId);
        if (!job) {
            return reject({
                code: 404,
                msg: `Can not push CC into job cause job not found!`
            })
        }

        let cc = (job.cc.filter(x => x._id == ccId))[0];
        if (is_root == 'true') {
            if (cc.root) {
                cc.root = rootId;
            }
        } else {
            if (cc.parents) {
                cc.parents = rootId;
            }
        }

        cc.tasks.push(taskId);

        await job.save()
            .then(_ => {
                return resolve(job)
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not push task into job cc with error: ${new Error(err.message)}`
                })
            })
    })
}

const PullTaskFromCC = (jobId, taskId) => {
    return new Promise(async (resolve, reject) => {
        let job = await Job.findById(jobId);
        if (!job) {
            return reject({
                code: 404,
                msg: `Job not found to pull task from CC!`
            })
        }

        job.cc.forEach(c => {
            c.tasks = c.tasks.filter(x => x._id != taskId);
        })

        await job.save()
            .then(_ => {
                return resolve(job);
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not pull task from CC with error: ${new Error(err.message)}`
                })
            })
    })
}
