const router = require("express").Router();
const Task = require("../../models/task-model");
const Customer = require('../../models/customer-model');
const Job = require('../../models/job-model');

const { authenticateEditorToken } = require("../../../middlewares/editor-middleware");


router.get('/', authenticateEditorToken, (req, res) => {
    let { page, search } = req.query;
    Task
        .find({
            editor: req.user._id
        })
        .populate('level', 'name -_id')
        .populate('job') //,'source_link intruction -_id'
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




    Task.findById(taskId)
        .populate('level', 'name')
        .populate('job')
        .exec()
        .then(task => {
            if (!task) {
                return res.status(404).json({
                    msg: `Task not found!`
                })
            }

            getCustomer(task.job.customer)
                .then(result => {
                    console.log(result);
                    return res.status(200).json({
                        msg: `Load task detail successfully!`,
                        task,
                        customer: result.customer
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
                msg: `Can not get task info with error: ${new Error(err.message)}`
            })
        })
})


router.put('/submit', authenticateEditorToken, async (req, res) => {
    /*
        - update trạng thái của task
        - link output của task
        - thời gian hoàn thành task
        - số lần chỉnh sửa
    */
    let { taskId, output_link,editor_done } = req.body;


    let task = await Task.findById(taskId);
    if(!task){
        return res.status(404).json({
            msg:`Task not found!`
        })
    }
    task.output_link = output_link;
    task.status = 1;
    task.edited_time = ++(task.edited_time);
    task.editor_done = editor_done;

    task
    .save()
    .then(_=>{
        return res.status(200).json({
            msg:`The task has been submited!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not submit task with error: ${new Error(err.message)}`
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

        Khi thỏa các điều kiện trên thì sẽ nhận được task của job có deadline gần nhất với thời điểm hiện tại
    
    */


    Task
        .find({ editor: req.user._id })
        .exec()
        .then(tasks => {
            if (tasks.length > 0) {
                
            }

        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get task by editor with error: ${new Error(err.message)}`
            })
        })

})



module.exports = router;



const getCustomer = (customerId) => {
    return new Promise((resolve, reject) => {
        Customer.findById(customerId)
            .populate({
                path: 'levels',
                populate: { path: 'level' }
            })
            .populate('output', 'name')
            .populate('size', 'name')
            .populate('color', 'name')
            .populate('cloud', 'name')
            .populate('nation', 'name')
            .exec((err, customer) => {
                if (err) {
                    return reject({
                        code: 500,
                        msg: `Can not get customer by id with error: ${new Error(err.message)}`
                    });
                }
                if (!customer) {
                    return reject({
                        code: 404,
                        msg: `Customer not found!`
                    });
                }

                return resolve({
                    code: 200,
                    msg: `Get customer by id successfully`,
                    customer
                });

            });
    })

}

