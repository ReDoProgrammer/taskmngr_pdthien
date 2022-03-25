const router = require('express').Router();
const Task = require('../../models/task-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");

router.get('/list-by-job', authenticateAccountantToken, (req, res) => {
    let { jobId } = req.query;
    Task
        .find({ job: jobId })
        .populate('level', 'name')
        .populate('qa', 'fullname -_id')
        .populate('editor', 'fullname -_id')
        .populate('dc', 'fullname -_id')
        .populate('created_by', 'fullname -_id')
        .populate('uploaded_by', 'fullname -_id')
        .populate({
            path: 'remarks',
            options: {
                sort: { timestamp: -1 }
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