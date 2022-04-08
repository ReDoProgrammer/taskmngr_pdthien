const router = require("express").Router();
const Task = require("../../models/task-model");
const Remark = require('../../models/remark-model');
const { authenticateDCToken } = require("../../../middlewares/dc-middleware");
const { getCustomer, getTaskDetail, getModule, getWage } = require('../common');
const _MODULE = 'DC';


router.put('/mark', authenticateDCToken, async (req, res) => {
    let { taskId, bpId, remark } = req.body;
    let task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        });
    }

    let rmk = new Remark({
        user: req.user._id,
        content: remark,
        tid: taskId
    });

    await rmk.save()
        .then(async r => {
            task.bp.push(bpId);
            task.updated_at = new Date();
            task.updated_by = req.user._id;
            task.remarks.push(r);

            await task.save()
                .then(_ => {
                    return res.status(200).json({
                        msg: `Mark task successfully!`
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not set mark into this task with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not create bonus penalty remark with error: ${new Error(err.message)}`
            })
        })




})

router.put('/submit', authenticateDCToken, async(req, res) => {
    let { taskId } = req.body;

    //validate asif the task has been submited before
    let task = await Task.findById(taskId);
    if(!task){
        return res.status(404).json({
            msg:`Task not found!`
        })
    }

    let dc = task.dc.filter(x=>x.staff == req.user._id && !x.unregisted && !x.submited_at);
    dc[0].submited_at = new Date();
    task.status = 3;
    
    await task.save()
    .then(_=>{
        return res.status(200).json({
            msg:`The task has been submited!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`This task can not be submited with error: ${new Error(err.message)}`
        })
    })


})

router.put('/unregister', authenticateDCToken, async (req, res) => {
    let { taskId } = req.body;

    let task = await Task.findById(taskId);
    if(!task){
        return res.status(404).json({
            msg:`Task not found!`
        })
    }

    

    let dc = task.dc.filter(x=>x.staff == req.user._id && !x.unregisted && !x.submited_at);
    dc[0].unregisted = true;
    await task.save()
    .then(_=>{
        return res.status(200).json({
            msg:`You have unregister this task successfully!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`You can not unregister this task with error: ${new Error(err.message)}`
        })
    })
})


router.put('/get-task', authenticateDCToken,async (req, res) => {
    let { taskId } = req.body;
    let task = await Task.findById(taskId);

    if(!task){
        return res.status(404).json({
            msg:`Task not found!`
        })
    }

    let chk = task.dc.filter(x=>x.staff != req.user._id && x.unregisted);
    
    if(chk.length > 0){
        return res.status(403).json({
            msg:`This task has been registed by another DC!`
        })
    }
    await getModule(_MODULE)
    .then(async module=>{        
        await getWage(req.user._id,task.basic.level._id,module._id)
        .then(async w=>{
            task.dc.push({
                staff:req.user._id,
                got_at: new Date(),
                wage: w.wage
            });
            await task.save()
            .then(_=>{
                return res.status(200).json({
                    msg:`You have registed this task successfully!`
                })
            })
            .catch(err=>{
                return res.status(500).json({
                    msg:`Can not get task with error: ${new Error(err.message)}`
                })
            })
        })
    })
    .catch(err=>{
        return res.status(err.code).json({
            msg:err.msg
        })
    })
   
  
   
    
})

router.put('/reject', authenticateDCToken, (req, res) => {
    let { taskId, remark } = req.body;

    getTaskDetail(taskId)
        .then(async task => {
            let rm = new Remark({
                user: req.user._id,
                content: remark,
                tid: task._id
            });

            await rm.save()
                .then(async r => {
                    task.remarks.push(r);
                    task.status = -3;
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
        .catch(err => {
            return res.status(err.code).json({
                msg: err.msg
            })
        })
})


router.get('/personal-tasks', authenticateDCToken, (req, res) => {
    let { page, search, status } = req.query;
    if (status == 100) {
        Task
            .find({ 'dc.staff': req.user._id })
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
                status,
                'dc.staff': req.user._id
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


router.get('/list', authenticateDCToken, (req, res) => {
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
            .populate('editor')
            .populate('qa')
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

router.get('/detail', authenticateDCToken, (req, res) => {
    let { taskId } = req.query;
    getTaskDetail(taskId)
        .then(async task => {
            await getCustomer(task.basic.job.customer)
                .then(customer => {
                    return res.status(200).json({
                        msg: `Get task info successfully!`,
                        customer,
                        task
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


module.exports = router;


