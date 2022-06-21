const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Task = require('../../models/task-model');
const Job = require('../../models/job-model');
const CC = require('../../models/cc-model');

const {
    getTaskDetail,
    getCustomer,
    getModule,
    getWage } = require('../common');
const { log } = require('npm');


const _EDITOR = 'EDITOR';
const _QA = 'QA';

const pageSize = 20;

router.put('/cc', authenticateTLAToken, async (req, res) => {
    let { taskId, remark, editor, qa, ccId } = req.body;


    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }


    let rm = new Remark({
        content: remark,
        tid: taskId,
        user: req.user._id
    });
    await rm.save()
        .then(async _ => {

            let cc = await CC.findById(ccId);
            if (!cc) {
                return res.status(404).json({
                    msg: `CC not found!`
                })
            }


            task.remarks.push(rm);
            task.status = -6;
            task.tasks_cc = cc._id;


            task.tla.updated.push({
                at: new Date(),
                by: req.user._id
            });

            /*
                Vì chức năng CC reject task chỉ áp dụng cho những task ít nhất đã được editor submit trước đó
                -- nên chỉ cần quan tâm tới trường hợp có editor truyền vào
                -- và khác editor hiện đang xử lý task đó
            */


            if (editor.length > 0 && task.editor[task.editor.length - 1].staff !== editor) {
                await getModule(_EDITOR)
                    .then(async m => {

                        await getWage(editor, task.basic.level, m._id)
                            .then(async w => {

                                let ed = {
                                    staff: editor,
                                    wage: w.wage,
                                    tla: req.user._id, //TLA gán task cho editor
                                    timestamp: new Date() //thời điểm được gán task
                                };


                                //xử lý liên quan tới timeline của editor hiện tại
                                if (task.editor[task.editor.length - 1].timeline && task.editor[task.editor.length - 1].timeline.length > 0) {
                                    task.editor[task.editor.length - 1].timeline[task.editor[task.editor.length - 1].timeline.length - 1].unregisted = true;
                                }


                                task.editor.push(ed);//thêm editor mới vào
                            })
                            .catch(err => {
                                console.log(err.msg);
                                return res.status(err.code).json({
                                    msg: err.msg
                                })
                            })
                    })
                    .catch(err => {
                        console.log(err.msg);
                        return res.status(err.code).json({
                            msg: err.msg
                        })
                    })
            }


            /*
                gán Q.A cần quan tâm tới
                1: qa được truyền vào phải là 1 id Q.A cụ thể
                2: thiết lập các thông số  cần thiết đối với các Q.A đã xử lý trước đó(nếu có)
            */

            console.log(qa)
            if (qa && qa.length > 0) {
                await getModule(_QA)
                    .then(async m => {
                        await getWage(qa, task.basic.level, m._id)
                            .then(async w => {
                                let q = {
                                    staff: qa,
                                    wage: w.wage,
                                    tla: req.user._id,
                                    timestamp: new Date()
                                };

                                if (task.qa.length > 0) {//nếu trước đó đã có Q.A xử lý
                                    if (task.qa[task.qa.length - 1].staff !== qa) {//chỉ cần xử lý trường hợp Q.A được truyền vào khác Q.A hiện đang xử lý task
                                        task.qa[task.qa.length].unregisted = true;//cập nhật lại trạng thái hủy nhận task đối với Q.A hiện tại
                                        task.qa.push(q);//thêm q.a mới vào
                                    }
                                } else {
                                    task.qa.push(q);//thêm q.a mới vào
                                }

                            })
                            .catch(err => {
                                console.log(err.msg);
                                return res.status(err.code).json({
                                    msg: err.msg
                                })
                            })
                    })
                    .catch(err => {
                        console.log(err.msg);
                        return res.status(err.code).json({
                            msg: err.msg
                        })
                    })
            }


            await task.save()
                .then(async _ => {
                    console.log(cc)
                    cc.status = 0;
                    await cc.save();
                    return res.status(200).json({
                        msg: `CC reject task successfully!`
                    })
                })
                .catch(err => {
                    console.log(`Can not CC reject task with error: ${new Error(err.message)}`)
                    return res.status(500).json({
                        msg: `Can not CC reject task with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            console.log(`Can not create remark with error: ${new Error(err.message)}`)
            return res.status(500).json({
                msg: `Can not create remark with error: ${new Error(err.message)}`
            })
        })

})


router.post('/cc', authenticateTLAToken, async (req, res) => {
    let { level, assigned_date, deadline, input_link, remark, editor, qa, jobId, customerId, ccId } = req.body;



    let job = await Job.findById(jobId);
    if (!job) {
        console.log(`Job not found!`)
        return res.status(404).json({
            msg: `Job not found!`
        })
    }

    let cc = await CC.findById(ccId);
    if (!cc) {
        console.log(`CC not found!`)
        return res.status(404).json({
            msg: `CC not found!`
        })
    }


    await getCustomerLevelPrice(customerId, level)
        .then(async p => {

            if (p.price == 0) {
                return res.status(403).json({
                    msg: `Customer level price unit not available!`
                })
            }



            let task = new Task();


            task.additional_task = ccId;//gán thông tin tham chiếu tới cc

            //THIẾT LẬP CÁC THÔNG TIN CƠ BẢN CỦA TASK
            let bs = {
                job: job,
                level: level,
                price: p.price
            };

            //deadline
            let dl = {};
            dl.begin = assigned_date;
            if (deadline.length !== 0) {
                dl.end = deadline;
            }
            bs.deadline = dl;

            let link = {};
            link.input = input_link;
            bs.link = link;

            task.basic = bs;



            //THÔNG TIN LIÊN QUAN TỚI TLA
            let tla = {};
            tla.created = {
                at: new Date(),
                by: req.user._id
            };

            task.tla = tla;









            // THÔNG TIN LIÊN QUAN TỚI GÁN EDITOR
            if (editor.length > 0) {
                await getModule(_EDITOR)
                    .then(async m => {
                        await getWage(editor, level, m._id)
                            .then(async w => {
                                let ed = {
                                    staff: editor,
                                    wage: w.wage,
                                    tla: req.user._id,
                                    timestamp: new Date()
                                };

                                task.editor = ed;
                                task.status = 0;

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

            }

            //THÔNG TIN LIÊN QUAN TỚI GÁN Q.A
            if (qa.length > 0) {
                await getModule(_QA)
                    .then(async m => {
                        await getWage(qa, level, m._id)
                            .then(async w => {
                                let q = {
                                    staff: qa,
                                    wage: w.wage,
                                    tla: req.user._id,
                                    timestamp: new Date()
                                };
                                task.qa = q;
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

            }



            let rm = new Remark({
                user: req.user._id,
                content: remark,
                tid: task._id
            });

            await rm.save()
                .then(async r => {
                    task.remarks.push(r);

                    await task.save()
                        .then(async _ => {
                            job.tasks.push(task);
                            job.cc.push(cc);
                            await job.save()
                                .then(async _ => {
                                    cc.status = 0;// trạng thái đang xử lý
                                    cc.additional_tasks.push(task);//thêm taskid vào danh sách CC task tạo mới
                                    await cc.save()
                                        .then(_ => {
                                            return res.status(201).json({
                                                msg: `New CC task has been created!`
                                            })
                                        })
                                })
                                .catch(err => {
                                    console.log(`Can not update tasks list into job with error: ${new Error(err.message)}`)
                                    return res.status(500).json({
                                        msg: `Can not update tasks list into job with error: ${new Error(err.message)}`
                                    })
                                })
                        })
                        .catch(err => {
                            console.log(`Can not create task with error: ${new Error(err.message)}`)
                            return res.status(500).json({
                                msg: `Can not create task with error: ${new Error(err.message)}`
                            })
                        })
                })
                .catch(err => {
                    console.log(`Can not create remark with error: ${new Error(err.message)}`)
                    return res.status(500).json({
                        msg: `Can not create remark with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            console.log(err);
            return res.status(err.code).json({
                msg: err.msg
            })
        })


})

router.get('/cc', authenticateTLAToken, async (req, res) => {
    let { jobId } = req.query;
    await CC.find({ job: jobId })
        .populate('created.by', 'fullname')
        .populate('update.by', 'fullname')
        .populate({
            path: 'fix_task',
            populate: {
                path: 'basic.level'
            }
        })
        .exec()
        .then(ccList => {
            return res.status(200).json({
                msg: 'Load CC list by job successfully!',
                ccList
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load CC list by job with error: ${new Error(err.message)}`
            })
        })
})

router.get('/list', authenticateTLAToken, async (req, res) => {
    let { jobId } = req.query;
    let tasks = await Task.find({ 'basic.job': jobId })
        .populate([
            {
                path: 'basic.job',
                select: 'name'
            },
            {
                path: 'basic.level',
                select: 'name'
            },
            {
                path: 'remarks',
                select: 'content'
            },
            {
                path: 'editor.staff',
                select: 'fullname username'
            },
            {
                path: 'qa.staff',
                select: 'fullname username'
            }
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
            {
                path: 'basic.level',
                select: 'name'
            },
            { path: 'editor.staff' },
            { path: 'qa.staff' },
            { path: 'remarks' }
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


router.get('/detail', authenticateTLAToken, (req, res) => {
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


router.get('/detail-to-edit', authenticateTLAToken, (req, res) => {
    let { taskId } = req.query;
    Task
        .findById(taskId)
        .populate('job')
        .populate('level')
        .populate({
            path: 'remarks',
            populate: {
                path: 'user'
            },
            options: {
                sort: { timestamp: -1 },
                user: req.user._id
            }
        })
        .exec()
        .then(async task => {
            if (!task) {
                return res.status(404).json({
                    msg: `Task not found!`
                })
            }

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
            return res.status(500).json({
                msg: `Can not get task detail with error: ${new Error(err.message)}`
            })
        })
})



router.post('/', authenticateTLAToken, async (req, res) => {
    let {
        jobId,
        level,
        assigned_date,
        deadline,
        input_link,
        remark,
        qa,
        editor,
        start
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
    if (qa) {
        getWage(qa, _QA, level)
            .then(wage => {
                task.qa = [
                    {
                        staff: qa,
                        tla: req.user._id,
                        timestamp: new Date(),
                        wage
                    }
                ]
            })
            .catch(err => {
                return res.status(err.code).json({
                    msg: err.msg
                })
            })

    }
    if (editor) {
        getWage(editor, _EDITOR, level)
            .then(wage => {
                task.editor = [
                    {
                        staff: editor,
                        timestamp: new Date(),
                        tla: req.user._id,
                        wage
                    }
                ]
            })
            .catch(err => {
                return res.status(err.code).json({
                    msg: err.msg
                })
            })
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
            PushTaskIntoJob(jobId, task._id)
                .then(async rs => {
                    task.remarks.push(rs[0]);
                    await task.save()
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

    if (task.status == 1 && task.qa.length > 0) {
        return res.status(403).json({
            msg: `You can not upload this task ultil Q.A submit it!`
        })
    }

    if (task.status == 2 && task.dc.length > 0) {
        return res.status(403).json({
            msg: `You can not upload this task ultil DC submit it!`
        })
    }

    let rmk = new Remark({
        user: req.user._id,
        content: remark,
        tid: task._id
    });

    await rmk.save()
        .then(async r => {
            task.status = 4;
            let up = {
                at: new Date(),
                by: req.user._id,
                link: uploaded_link
            };

            task.tla.uploaded.push(up);
            task.remarks.push(r);

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
        .catch(err => {
            return res.status(500).json({
                msg: `Can not create remark when upload this task with error: ${new Error(err.message)}`
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
    if (qa) {
        getWage(qa, _QA, level)
            .then(wage => {
                task.qa = [
                    {
                        staff: qa,
                        tla: req.user._id,
                        timestamp: new Date(),
                        wage
                    }
                ]
            })
            .catch(err => {
                return res.status(err.code).json({
                    msg: err.msg
                })
            })

    }
    if (editor) {
        getWage(editor, _EDITOR, level)
            .then(wage => {
                task.editor = [
                    {
                        staff: editor,
                        timestamp: new Date(),
                        tla: req.user._id,
                        wage
                    }
                ]
            })
            .catch(err => {
                return res.status(err.code).json({
                    msg: err.msg
                })
            })
    }


    task.status = start == 'true' ? (editor ? 0 : -1) : -10;



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
            PullTaskFromJob(task.basic.job, task._id)
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

const PushTaskIntoJob = (jobId, taskId) => {
    return new Promise(async (resolve, reject) => {
        let job = await Job.findById(jobId);
        if (!job) {
            return reject({
                code: 404,
                msg: `Job not found!`
            })
        }
        job.tasks.push(taskId);
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
        job.tasks.pull(taskId);
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




