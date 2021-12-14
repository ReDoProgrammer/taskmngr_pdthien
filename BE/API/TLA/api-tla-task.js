const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Task = require('../../models/task-model');
const moment = require('moment');

router.get('/list', authenticateTLAToken, (req, res) => {
    let { jobId } = req.query;
    Task
        .find({ job: jobId })
        .populate('level', 'name -_id')
        .populate('qa', 'fullname -_id')
        .populate('editor', 'fullname -_id')
        .exec()
        .then(tasks => {      
            console.log(tasks);     
            return res.status(200).json({
                tasks,
                msg: 'Load tasks by job id successfully!'
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load task with job ${jobId}`,
                error: new Error(err.message)
            })
        })
})

router.get('/', authenticateTLAToken, (req, res) => {
    let { page, search } = req.query;
    Task
        .find(
            {
                // $or: [
                //     { firstname: { "$regex": search, "$options": "i" } },
                // ]
            }
        )
        .populate('level')
        .exec()
        .then(tasks => {
            return res.status(200).json({
                msg: 'Load tasks list successfully!',
                tasks
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load taks list with error: ${new Error(err.message)}`
            })
        })

})

router.get('/detail', authenticateTLAToken, (req, res) => {

})

router.post('/', authenticateTLAToken, (req, res) => {
    let { job, level, remark } = req.body;
    let task = new Task({
        job,
        level,
        remark
    });
    task.save()
        .then(_ => {
            return res.status(201).json({
                msg: `Task has been created`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not create task with error: ${new Error(err.message)}`,
                error: new Error(err.message)
            })
        })

})

router.put('/', authenticateTLAToken, (req, res) => {
    // phần này chỉ dùng khi TLA muốn assign nhiệm vụ Q.A hoặc edit trực tiếp cho nhân viên khi phân job ra thành level
    /**
     * XẢY RA 2 TRƯỜNG HỢP NHƯ SAU:
     * TH1: TLA assign editor/q.a hoặc cả editor và q.a cho cùng 1 nhân viên
     * TH2: TLA assign editor và q.a cho 2người khác nhau.
     * => để tránh trường hợp bị đè nếu ở TH2 thì cần tìm kiếm task trước đó và update lại trạng thái, nhân viên đã có 
     * 
     */
    let { taskId, staff, qa, editor } = req.body;

    Task.findById(taskId)
    .exec()
    .then(t=>{
        Task.findByIdAndUpdate(taskId,
            {
                qa: (qa == 'true' ? staff : t.qa),
                qa_assigned:(qa=='true'?true:t.qa_assigned),
                editor: (editor == 'true' ? staff : t.editor),
                editor_assigned:(editor=='true'?true:t.editor_assigned)
            }, { new: true }, (err, task) => {
                if (err) {
                    return res.status(500).json({
                        msg: `Assigned staff failed with error: ${new Error(err.message)}`
                    })
                }
                if (task == null) {
                    return res.status(404).json({
                        msg: `Task not found`
                    })
                }
    
                return res.status(200).json({
                    msg: `Staff has been assigned successfully!`
                })
            })
    })
    .catch(err =>{
        return res.status(500).json({
            msg:`Can not find task by id ${new Error(err.mesaage)}`
        })
    })

   

})

router.delete('/', authenticateTLAToken, (req, res) => {
    let { _id } = req.body;
    Task.findByIdAndDelete(_id)
        .exec()
        .then(_ => {
            return res.status(200).json({
                msg: 'Task has been deleted!'
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this task`,
                error: `Error found: ${new Error(err.message)}`
            })
        })
})


module.exports = router;



