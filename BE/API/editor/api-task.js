const router = require("express").Router();
const Task = require("../../models/task-model");
const Customer = require('../../models/customer-model');
const { assignOrTakeTask,
    getJobLevelBasedOnConditons,
    getCustomer,
    getTaskDetail } = require('../common');

const { authenticateEditorToken } = require("../../../middlewares/editor-middleware");

const _MODULE = 'EDITOR';


router.post('/change-amount', authenticateEditorToken, (req, res) => {
    let { amount, taskId } = req.body;
    Task
        .findByIdAndUpdate(taskId,
            { amount }, { new: true }, (err, task) => {
                if (err) {
                    return res.status(500).json({
                        msg: `Can not change amount of image with error: ${new Error(err.message)}`
                    })
                }

                if (!task) {
                    return res.status(404).json({
                        msg: `Task not found!`
                    })
                }

                return res.status(200).json({
                    msg: `Change number of image successfully!`,
                    task
                })
            })
})

router.get('/statistic', authenticateEditorToken, (req, res) => {
    Task
        .find({ editor: req.user._id })
        .exec()
        .then(tasks => {
            var total = tasks.length;
            var rejected = (tasks.filter(x => x.status <= -2 && x.status >= -4)).length;
            var canceled = (tasks.filter(x => x.status === -5)).length;
            var done = (tasks.filter(x => x.status >= 5)).length;
            var edited = (tasks.filter(x => x.status >= 1 && x.status < 5 && x.edited_time === 1)).length;
            var fixed = (tasks.filter(x => x.edited_time > 1)).length;
            var processing = (tasks.filter(x => x.status === 0)).length;
            return res.status(200).json({
                msg: `Get tasks statistic successfully!`,
                total,
                rejected,
                canceled,
                done,
                edited,
                fixed,
                processing
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get tasks statistic with error: ${new Error(err.message)}`
            })
        })
})

router.get('/', authenticateEditorToken, (req, res) => {
    let { page, search, status } = req.query;
    Task
        .find({ 'editor.staff': req.user._id })//chỉ load những task đã được TLA gán hoặc editor đã nhận được
        .populate('level', 'name -_id')
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


router.put('/submit', authenticateEditorToken,async (req, res) => {
    let { taskId, output_link, amount } = req.body;

    let task = await Task.findById(taskId);
    if(!task){
        return res.status(404).json({
            msg:`Task not found!`
        })
    }
    // let ed = task.editor.find(x=>x.staff === req.user._id).sort((x,y)=>{
    //     return x.
    // });
    

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
            status: { $in: [0, -2, -3] }//task chưa submit hoặc bị reject bởi QA/DC
        }, (err, count) => {
            if (err) {
                return res.status(500).json({
                    msg: `Can not check tasks have been editing with error: ${new Error(err.message)}`
                })
            }
            if (count > 0) {
                return res.status(403).json({
                    msg: `You can not get more task ultil your editing tasks have been submited!`
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



