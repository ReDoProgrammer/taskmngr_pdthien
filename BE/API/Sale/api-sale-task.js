const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Task = require('../../models/task-model');
const { getCustomer, getTaskDetail, getModule, getWage } = require('../common');



router.get('/list', authenticateSaleToken, (req, res) => {
    let { jobId } = req.query;
    Task
        .find({ job: jobId })
        .populate('level', 'name')
        .populate('qa', 'fullname -_id')
        .populate('editor', 'fullname -_id')
        .populate('created_by', 'fullname -_id')
        .populate('updated_by', 'fullname -_id')
        .populate({
            path:'remarks',
            options: {               
                sort: { timestamp: -1}   
            }
        })
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


router.get('/all', authenticateSaleToken, (req, res) => {
    let { page,search,status } = req.query;
    Task
        .find({ })
        .populate({
            path: 'job',
            populate: {
                path: 'customer'
            }
        })
        .populate('level', 'name')
        .populate('qa', 'fullname -_id')
        .populate('editor', 'fullname -_id')
        .populate('dc', 'fullname -_id')
        .populate('created_by', 'fullname -_id')
        .populate('updated_by', 'fullname -_id')
        .populate('uploaded_by', 'fullname -_id')       
        .populate({
            path:'remarks',
            options: {               
                sort: { timestamp: -1}   
            }
        })
        .exec()
        .then(tasks => {  
            return res.status(200).json({
                tasks,
                msg: 'Load taskslist successfully!'
            })
        })
        .catch(err => {
            console.log(`Can not load tasks list with error:  ${jobId}`);
            return res.status(500).json({
                msg: `Can not load tasks list with error: ${jobId}`,
                error: new Error(err.message)
            })
        })
})

router.get('/detail',authenticateSaleToken,(req,res)=>{
    let { taskId } = req.query;
    getTaskDetail(taskId)
        .then(async task => {
            await getCustomer(task.job.customer)
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