const router = require('express').Router();
const Queue = require('../../models/queue-model');
const Task = require('../../models/task-model');
const StaffJobLevel = require('../../models/staff-job-level-model');
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const _EDITOR = 'EDITOR';
const {
    getUser,
    getCustomer,
    getModule,
    getWage,
    GetJobLevelsByStaffLevel } = require('../common');
    const ObjectId = require('mongodb').ObjectId;


router.post('/', authenticateTLAToken, async (req, res) => {

    let { taskId } = req.body;

    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            msg: `Task not found!`
        })
    }

    Queue
        .find({})
        .populate('staff')
        .sort({ timestamp: 1 })
        .then(async queues => {
            queues.forEach(q => {
                GetJobLevelsByStaffLevel(q.staff.user_level)
                    .then(levels => {
                        let lv = levels.map(x => {return x.job_lv});

                        let t = lv.filter(x=>x == task.basic.level)
                        console.log(t)
                    })
                    .catch(err => {
                        return res.status(err.code).json({
                            msg: err.msg
                        })
                    })                   
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get editor queue with error: ${new Error(err.message)}`
            })
        })


})

module.exports = router;







