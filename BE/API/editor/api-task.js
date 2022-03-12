const router = require("express").Router();
const Task = require("../../models/task-model");
const Customer = require('../../models/customer-model');
const { assignOrTakeTask,
    getJobLevelBasedOnConditons,
    getCustomer,
    getTaskDetail } = require('../common');

const { authenticateEditorToken } = require("../../../middlewares/editor-middleware");

const _MODULE = 'EDITOR';


router.get('/', authenticateEditorToken, (req, res) => {
    let { page, search,status } = req.query;
    Task
        .find({ editor: req.user._id })//chỉ load những task đã được TLA gán hoặc editor đã nhận được
        .populate('level', 'name -_id')
        .populate({
            path: 'job',
            populate: {
                path: 'customer'
            }
        })
        .populate('qa')
        .sort({ deadline: -1 })//sắp xếp giảm dần theo deadline
        .sort({ status: 1 })//sắp xếp tăng dần theo trạng thái của task
        .exec()
        .then(tasks => {
            return res.status(200).json({
                msg: `Load your tasks list successfully!`,
                tasks
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load your tasks list with error: ${new Error(err.message)}`
            })
        })
})


router.get('/detail', authenticateEditorToken, (req, res) => {
    let { taskId } = req.query;


    getTaskDetail(taskId)
        .then(async task => {
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
            return res.status(err.code).json({
                msg: err.msg
            })
        })
})


router.put('/submit', authenticateEditorToken, (req, res) => {
    let { taskId, output_link, amount } = req.body;

    Task
        .findById(taskId)
        .exec()
        .then(task => {
            if (!task) {
                return res.status(404).json({
                    msg: `Task not found!`
                })
            }

            Task
                .findByIdAndUpdate(taskId, {
                    output_link,
                    status: 1,
                    amount,
                    edited_time: ++(task.edited_time)
                }, { new: true }, (err, task) => {
                    if (err) {
                        return res.status(500).json({
                            msg: `Can not find and update task by id with error: ${new Error(err.message)}`
                        })
                    }

                    return res.status(200).json({
                        msg: `The task has been submited!`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get task by id with error: ${new Error(err.message)}`
            })
        })

})






router.put('/get-more', authenticateEditorToken, (req, res) => {
    //----------TÁC VỤ NHẬN task MỚI ---------------//
    /*
        TH1: editor đang không xử lý bất kì 1 job nào hoặc các job editor xử lý đã đc giao hết cho khách -> nhận thêm đc 1 level (task) của job mới
        TH2: editor đã xử lý xong(đã submit done) và Q.A chưa submit done, editor có quyền nhận thêm 1 level(task) của job mới. 
        Tuy nhiên khi editor submit done task mới này thì sẽ không được nhận thêm bất cứ 1 task(level) của job mới nào nữa cho tới khi Q.A submit done

        Editor chỉ được phép nhận các task có job level phù hợp với trình độ của mình (staff group)

        Khi thỏa các điều kiện trên thì sẽ nhận được task của job có deadline gần nhất với thời điểm hiện tạichốt
    
    */


    Task
        .countDocuments({
            editor: req.user._id,
            status: 0//task đang được xử lý 
        }, (err, count) => {
            if (err) {
                return res.status(500).json({
                    msg: `Can not check tasks have been editing with error: ${new Error(err.message)}`
                })
            }
            if (count > 0) {
                return res.status(403).json({
                    msg: `You can not get more task till your editing tasks have been submited!`
                })
            }

            getJobLevelBasedOnConditons(req.user._id, _MODULE)
                .then(levels => {
                    Task
                        .findOne({
                            level: { $in: levels },
                            status: -1
                        })
                        .sort({ deadline: 1 })
                        .exec()
                        .then(t => {
                            if (!t) {
                                return res.status(404).json({
                                    msg: `No available task to take!`
                                })
                            }
                            assignOrTakeTask(_MODULE, t._id, t.level, req.user._id, false)
                                .then(t => {
                                    return res.status(200).json({
                                        msg: `You have take task successfully!`,
                                        t
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
                                msg: `Can find initial task with error: ${new Error(err.message)}`
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



module.exports = router;



