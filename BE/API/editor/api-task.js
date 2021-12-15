const router = require("express").Router();
const Task = require("../../models/task-model");
const { authenticateEditorToken } = require("../../../middlewares/editor-middleware");


router.get('/', authenticateEditorToken, (req, res) => {
    /*
        - B1: kiểm tra xem editor có đang vướng task nào không
        - B2: Nếu đang vướng task thì sẽ không được chọn task mới. 
            Ngược lại show 1 task chưa có người nhận được sắp xếp ưu tiên theo thời gian giao cho khách ( của job) hoặc đc TLA assign 
    */

    Task.countDocuments({
        staff: req.user._id,
        status: 0,
        // editor_assigned: true
    })
        .exec()
        .then(count => {

            if (count == 0) {
                Task
                    .find({
                        $or: [
                            { staff: req.user._id },
                            { status: -1 }
                        ]
                    })
                    .populate('level', 'name -_id')
                    .populate({ path: 'job', options: { sort: { 'created_at': -1 } } })
                    .limit(1)
                    .exec()
                    .then(tasks => {
                        return res.status(200).json({
                            msg: 'Load your tasks successfully!',
                            tasks
                        })
                    })
                    .catch(err => {
                        return res.status(500).json({
                            msg: 'Load your tasks failed',
                            error: `${new Error(err.message)}`
                        })
                    })
            } else {
                return res.status(403).json({
                    msg: `You can not get more than task`
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not check tasks that are processing by editor. ${new Error(err.message)}`
            })
        })


})


router.get('/detail', authenticateEditorToken, (req, res) => {
    let { taskId } = req.query;

    Task.findById(taskId)
        .populate('level', 'name')
        .populate({
            path: 'job',
            populate: {
                path: 'customer',             
                populate: {
                    path: 'size'                   
                },
                populate: {
                    path: 'color_mode'                  
                }
            }
        }

        )
        .exec()
        .then(task => {
            console.log(task);
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get task info with error: ${new Error(err.message)}`
            })
        })
})

router.put('/', authenticateEditorToken, (req, res) => {
    //----------TÁC VỤ NHẬN LEVEL MỚI ---------------//
    /*
        TH1: editor đang không xử lý bất kì 1 job nào hoặc các job editor xử lý đã đc giao hết cho khách -> nhận thêm đc 1 level (task) của job mới
        TH2: editor đã xử lý xong(đã submit done) và Q.A chưa submit done, editor có quyền nhận thêm 1 level(task) của job mới. 
        Tuy nhiên khi editor submit done task mới này thì sẽ không được nhận thêm bất cứ 1 task(level) của job mới nào nữa cho tới khi Q.A submit done
    
    */
    let { taskId } = req.body;
    Task.findByIdAndUpdate(taskId,
        {
            staff: req.user._id,
            status: 0,
            editor: true
        }, { new: true },
        (err, task) => {
            if (err) {
                return res.status(500).json({
                    msg: `Get new task failed with error: ${new Error(err.message)}`,
                    error: new Error(err.message)
                })
            }
            if (task == null) {
                return res.status(404).json({
                    msg: `Task not found`
                })
            }
            return res.status(200).json({
                msg: `Task has been got successfully!`
            })
        }
    )
})



module.exports = router;