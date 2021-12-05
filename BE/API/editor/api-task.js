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
        editor:true
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
            }else{
                return res.status(403).json({
                    msg:`You can not get more than task`
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not check tasks that are processing by editor. ${new Error(err.message)}`
            })
        })


})


router.post('/get-task',authenticateEditorToken,(req,res)=>{
    
})

router.get('/detail', authenticateEditorToken, (req, res) => {

})

router.put('/', authenticateEditorToken, (req, res) => {

})



module.exports = router;