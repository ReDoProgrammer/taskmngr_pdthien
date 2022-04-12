const router = require("express").Router();
const Task = require("../../models/task-model");
const Remark = require('../../models/remark-model');
const { authenticateQAToken } = require("../../../middlewares/qa-middleware");
const { getWage, getModule, getCustomer, getTaskDetail } = require('../common');
const _MODULE = 'QA';

router.put('/unregister', authenticateQAToken, async (req, res) => {
    let { taskId } = req.body;
   let task = await Task.findById(taskId);
   if(!task){
       return res.status(404).json({
           msg:`Task not found!`
       })
   }

   let q = task.qa.filter(x=>x.staff == req.user._id && !x.unregisted);
   if(q.length == 0){
       return res.status(404).json({
           msg:`Q.A not found!`
       })
   }
   q[q.length-1].unregisted = true;
   await task.save()
   .then(_=>{
       return res.status(200).json({
           msg:`You have unregisted this task successfully!`
       })
   })
   .catch(err=>{
       return res.status(500).json({
           msg:`Can not unregister this task with error: ${new Error(err.message)}`
       })
   })

})

router.put('/get-task', authenticateQAToken, (req, res) => {
    let { taskId } = req.body;
    Task
        .countDocuments({
            /*
                kiểm tra số task mà Q.A đang nhận chưa submit
                nếu quá 2 task thì sẽ không được nhận thêm task
            */
            'qa.staff': req.user._id,
            'qa.tla':{$ne:null},
            status: { $in: [0, 1] }
        }, async (err, count) => {
            if (err) {
                return res.status(500).json({
                    msg: `Can not check task have been processing with error: ${new Error()}`
                })
            }
            if (count > 2) {
                return res.status(403).json({
                    msg: `You can not get more task when your tasks have been not submited!`
                })
            }

            /*
                Kiểm tra xem task được nhận có phù hợp với trình độ của Q.A 
                và đã được thiết lập tiền công rồi hay chưa
            */
            let task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    msg: `Task not found!`
                })
            }

            if (task.qa.length > 0 && !task.qa[task.qa.length - 1].unregisted) {
                return res.status(403).json({
                    msg: `This task has been registed by another Q.A!`
                })
            }

            await getModule(_MODULE)//lay module
                .then(async m => {
                    getWage(req.user._id, task.basic.level, m._id)//kiem tra xem level va q.a nay da duoc set tien cong chua
                        .then(async w => {
                            let q = {
                                staff:req.user._id,
                                wage: w.wage,
                                timestamp: new Date()
                            };
                            task.qa.push(q);

                            await task.save()
                            .then(_=>{
                                return res.status(200).json({
                                    msg:`You have registed the task successfully!`
                                })
                            })
                            .catch(err=>{
                                return res.status(500).json({
                                    msg:`Can not register this task with error: ${new Error(err.message)}`
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
})

router.put('/submit', authenticateQAToken, async (req, res) => {
    let { taskId } = req.body;

    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    task.qa[task.qa.length - 1].submited_at.push(new Date());
    task.status = 2;

    await task.save()
        .then(t => {
            return res.status(200).json({
                msg: `The task has been submited!`,
                t
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not submit this task with error: ${new Error(err.message)}`
            })
        })




})

router.put('/reject', authenticateQAToken, async (req, res) => {
    let { taskId, remark } = req.body;

    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
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
            task.status = -2;
            task.rejected.push({
                at: new Date(),
                by:req.user._id,
                rm:rm._id
            });
            await task.save()
                .then(t => {
                    return res.status(200).json({
                        msg: `The task has been rejected!`
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not reject this task with error: ${new Error(err.message)}`
                    })
                })

        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not insert reject remark with error: ${new Error(err.message)}`
            })
        })
})

router.get('/list', authenticateQAToken, (req, res) => {
    let { page, search, status } = req.query;
    if (status == 100) {
        Task
            .find({})
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
            .exec()
            .then(tasks => {
                return res.status(200).json({
                    msg: `Load tasks list successfully!`,
                    tasks
                })
            })
            .catch(err => {
                return res.status(500).json({
                    msg: `Can not get tasks list with error: ${new Error(err.message)}`
                })
            })
    } else {
        Task
            .find({
                status
            })
            .populate({
                path: 'job',
                populate: {
                    path: 'customer'
                }
            })
            .populate('level')

            .exec()
            .then(tasks => {
                return res.status(200).json({
                    msg: `Load tasks list successfully!`,
                    tasks
                })
            })
            .catch(err => {
                return res.status(500).json({
                    msg: `Can not get tasks list with error: ${new Error(err.message)}`
                })
            })
    }

})

router.get('/detail', authenticateQAToken, (req, res) => {
    let { taskId } = req.query;

    getTaskDetail(taskId)
        .then(async t => {
            await getCustomer(t.basic.job.customer)
                .then(customer => {
                    return res.status(200).json({
                        msg: `Get task info successfully!`,
                        customer,
                        task: t
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

router.get('/personal', authenticateQAToken, (req, res) => {
    let { page, search, status } = req.query;
    if (status == 100) {
        Task
            .find({ 
                'qa.staff': req.user._id,
                'qa.unregisted':false 
            })
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
            .exec()
            .then(tasks => {
                return res.status(200).json({
                    msg: `Load tasks list successfully!`,
                    tasks
                })
            })
            .catch(err => {
                return res.status(500).json({
                    msg: `Can not get tasks list with error: ${new Error(err.message)}`
                })
            })
    } else {
        Task
            .find({
                status
            })
            .populate({
                path: 'job',
                populate: {
                    path: 'customer'
                }
            })
            .populate('level')

            .exec()
            .then(tasks => {
                return res.status(200).json({
                    msg: `Load tasks list successfully!`,
                    tasks
                })
            })
            .catch(err => {
                return res.status(500).json({
                    msg: `Can not get tasks list with error: ${new Error(err.message)}`
                })
            })
    }
})



module.exports = router;


