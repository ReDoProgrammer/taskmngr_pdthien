const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Task = require('../../models/task-model');
const CustomerLevel = require('../../models/customer-level-model');
const Job = require('../../models/job-model');
const Remark = require('../../models/remark-model');
const CC = require('../../models/cc-model');

const {
    getTaskDetail,
    getCustomer,
    getModule,
    getWage } = require('../common');
const { log } = require('npm');


const _EDITOR = 'EDITOR';
const _QA = 'QA';

router.put('/cc', authenticateTLAToken, async (req, res) => {
    let { taskId, remark, editor, qa,ccId } = req.body;

    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }
    

    let rm = new Remark();
    rm.content = remark;
    rm.tid = taskId;
    rm.user = req.user._id;
    await rm.save()
        .then(async _ => {
            
            let cc = await CC.findById(ccId);
            if(!cc){
                return res.status(404).json({
                    msg:`CC not found!`
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
            if (qa.length > 0) {
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

                                if(task.qa.length>0){//nếu trước đó đã có Q.A xử lý
                                    if(task.qa[task.qa.length-1].staff !==qa){//chỉ cần xử lý trường hợp Q.A được truyền vào khác Q.A hiện đang xử lý task
                                        task.qa[task.qa.length].unregisted = true;//cập nhật lại trạng thái hủy nhận task đối với Q.A hiện tại
                                        task.qa.push(q);//thêm q.a mới vào
                                    }
                                }else{
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
            .then(async _=>{
                console.log(cc)
                cc.status = 0;
                await cc.save();
                return res.status(200).json({
                    msg:`CC reject task successfully!`
                })
            })
            .catch(err=>{
                return res.status(500).json({
                    msg:`Can not CC reject task with error: ${new Error(err.message)}`
                })
            })
        })
        .catch(err => {
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
        .then(async result => {

            if (result.cl.price == 0) {
                return res.status(403).json({
                    msg: `Customer level price unit not available!`
                })
            }

            let task = new Task();


            task.tasks_cc = ccId;//gán thông tin tham chiếu tới cc

            //THIẾT LẬP CÁC THÔNG TIN CƠ BẢN CỦA TASK
            let bs = {
                job: job,
                level: level,
                price: result.cl.price
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
                                    if (cc.tasks)
                                        cc.tasks.push(task);//thêm taskid vào danh sách CC task tạo mới
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

router.get('/list', authenticateTLAToken, (req, res) => {
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
            {
                path: 'basic.level',
                select: 'name'
            },
            {
                path: 'editor.staff',
                select: 'fullname username'
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
                    path: 'remarks',
                    options: { sort: { 'timestamp': -1 } }
                }
            ])

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

            getCustomerIdFromJob(job)
                .then(async result => {
                    await getCustomerLevelPrice(result.customerId, level)
                        .then(async result => {

                            if (result.cl.price == 0) {
                                return res.status(403).json({
                                    msg: `Customer level price unit not available!`
                                })
                            }

                            let task = new Task();



                            //THIẾT LẬP CÁC THÔNG TIN CƠ BẢN CỦA TASK
                            let bs = {
                                job: job,
                                level: level,
                                price: result.cl.price
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
                            if (editor_assigned == 'true') {
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
                            if (qa_assigned == 'true') {
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
                                        .then(async t => {
                                            j.tasks.push(t);
                                            await j.save()
                                                .then(_ => {
                                                    return res.status(201).json({
                                                        msg: `Task has been created successfully!`
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
                .catch(err => {
                    console.log(err);
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
        editor_assigned,
        qa_assigned,
        qa,
        editor
    } = req.body;

    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            msg: `Can not update task because it\'s not found!`
        })
    }
    let rm = await Remark.findById(task.remarks[0]._id);
    rm.content = remark;
    await rm.save()
        .then(async _ => {
            task.basic.deadline.end = deadline;
            task.basic.link.input = input_link;

            task.tla.updated.push({
                at: new Date(),
                by: req.user._id
            })

            //cập nhật Editor

            if (editor_assigned == 'true') {
                task.status = 0;
                if (task.editor.length == 0) {
                    await getModule(_EDITOR)
                        .then(async m => {
                            await getWage(editor, task.basic.level, m._id)
                                .then(async w => {
                                    let ed = {
                                        staff: editor,
                                        wage: w.wage,
                                        tla: req.user._id,
                                        timestamp: new Date()
                                    };

                                    task.editor.push(ed);

                                })
                                .catch(err => {
                                    console.log(err)
                                    return res.status(err.code).json({
                                        msg: err.msg
                                    })
                                })
                        })
                        .catch(err => {
                            console.log(err)
                            return res.status(err.code).json({
                                msg: err.msg
                            })
                        })
                } else {

                    if (task.editor[task.editor.length - 1].staff !== editor) {
                        await getModule(_EDITOR)
                            .then(async m => {

                                await getWage(editor, task.basic.level, m._id)
                                    .then(async w => {
                                        let ed = {
                                            staff: editor,
                                            wage: w.wage,
                                            tla: req.user._id,
                                            timestamp: new Date()
                                        };

                                        task.editor.push(ed);

                                    })
                                    .catch(err => {
                                        console.log(err)
                                        return res.status(err.code).json({
                                            msg: err.msg
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
                }




            } else {
                //trường hợp không gán editor thì set về mặc định
                task.editor = [];
                task.status = -1;
            }



            //Cập nhật Q.A

            if (qa_assigned == 'true') {
                if (task.qa.length == 0) {
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

                                    task.qa.push(q);

                                })
                                .catch(err => {
                                    console.log(err)
                                    return res.status(err.code).json({
                                        msg: err.msg
                                    })
                                })
                        })
                        .catch(err => {
                            console.log(err)
                            return res.status(err.code).json({
                                msg: err.msg
                            })
                        })
                } else {
                    //chỉ update khi Q.A truyền vào khác Q.A hiện đang nhận task           
                    if (task.qa[task.qa.length - 1].staff !== qa) {
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

                                        task.qa.push(q);

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
                }
            } else {
                //trường hợp không gán Q.A thì set về mặc định
                task.qa = [];
            }

            await task
                .save()
                .then(_ => {
                    return res.status(200).json({
                        msg: `This task has been changed!`
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not update this task with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not update remark with error: ${new Error(err.message)}`
            })
        })
})



router.delete('/', authenticateTLAToken, (req, res) => {
    let { _id } = req.body;
    Task.findByIdAndDelete(_id)
        .exec()
        .then(async task => {
            if (!task) {
                return res.status(404).json({
                    msg: `Task not found!`
                })
            }
            await Job
                .findByIdAndUpdate(task.basic.job._id, {
                    $pull: { tasks: _id }
                }, async (err, job) => {
                    if (err) {
                        console.log(`Can not pull this task from parent job with error: ${new Error(err.message)}`)
                        return res.status(500).json({
                            msg: `Can not pull this task from parent job with error: ${new Error(err.message)}`
                        })
                    }
                    if (!job) {
                        return res.status(404).json({
                            msg: `Parent job not found!`
                        })
                    }

                    await Remark
                        .deleteMany({ tid: _id }, async err => {
                            if (err) {
                                console.log(`Can not delete remarks belong to this task with error: ${new Error(err.message)}`);
                                return res.status(500).json({
                                    msg: `Can not delete remarks belong to this task with error: ${new Error(err.message)}`
                                })
                            }



                            await Job.findByIdAndUpdate(task.basic.job,
                                {
                                    $pull: { tasks: _id }
                                }, { new: true }, (err, job) => {
                                    if (err) {
                                        return res.status(500).json({
                                            msg: `Can not pull this task from parent job with error: ${new Error(err.message)}`
                                        })
                                    }
                                    if (!job) {
                                        console.log(`Can not find parent job of this task!`);
                                        return res.status(404).json({
                                            msg: `Can not find parent job of this task!`
                                        })
                                    }
                                    return res.status(200).json({
                                        msg: `The task has been deleted!`
                                    })
                                })

                        })


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

