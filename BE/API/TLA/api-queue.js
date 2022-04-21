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
                        let lv = levels.map(x => { return x.job_lv });
                        let t = lv.filter(l => l == task.basic.level)
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

router.get('/list-by-level', authenticateTLAToken, (req, res) => {
    let { levelId } = req.query;

    StaffJobLevel
        .find({ job_lv: levelId })
        .then(async sjl => {
            let lv = sjl.map(x=> x.staff_lv)

            await Queue
                .find({})
                .populate('staff', null, { user_level: {$in: lv} } )//lọc những nhân viên có trình độ phù hợp từ hàng chờ
                .sort({timestamp:1})//sắp xếp tăng dần theo thời gian đăng ký hàng chờ
                .then(qs => {
                    return res.status(200).json({
                        msg: `Get queue editors successfully!`,
                        qs
                    })
                })
                .catch(err => {
                    console.log(`Can not get queue editors with error: ${new Error(err.message)}`)
                    return res.status(500).json({
                        msg: `Can not get queue editors with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            console.log(`Can not get staff job level with error: ${new Error(err.message)}`)
            return res.status(500).json({
                msg: `Can not get staff job level with error: ${new Error(err.message)}`
            })
        })


})

module.exports = router;







