const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Task = require('../../models/task-model');




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

module.exports = router;