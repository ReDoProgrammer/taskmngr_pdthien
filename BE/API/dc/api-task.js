const router = require("express").Router();
const Task = require("../../models/task-model");
const { authenticateDCToken } = require("../../../middlewares/dc-middleware");
const {getCustomer,getTaskDetail } = require('../common');
const _MODULE = 'DC';

router.put('/reject', authenticateDCToken, (req, res) => {
    let { taskId, remark } = req.body;

    Task
        .findByIdAndUpdate(taskId, {
            qa_done: new Date(),
            status: -2,
            qa: req.user._id,
            remark
        },
            { new: true },
            (err, task) => {
                if (err) {
                    return res.status(500).json({
                        msg: `Can not reject task with error: ${new Error(err.message)}`
                    })
                }

                if (!task) {
                    return res.status(404).json({
                        msg: `Task not found!!`
                    })
                }

                return res.status(200).json({
                    msg: `The task has been rejected!`,
                    task
                })
            })
})

router.get('/list', authenticateDCToken, (req, res) => {
    let { page, search, status } = req.query;
    if(status == 100){
        Task
        .find({})
        .populate({
            path : 'job',
            populate : {
              path : 'customer'
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
    }else{
        Task
        .find({
            status
        })
        .populate({
            path : 'job',
            populate : {
              path : 'customer'
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

router.get('/detail', authenticateDCToken, (req, res) => {
    let { taskId } = req.query;
    getTaskDetail(taskId)
    .then(async task=>{
        await getCustomer(task.job.customer)
        .then(customer=>{
            return res.status(200).json({
                msg:`Get task info successfully!`,
                customer,
                task
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


module.exports = router;


