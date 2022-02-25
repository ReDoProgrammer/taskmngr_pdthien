const router = require("express").Router();
const Task = require("../../models/task-model");
const Customer = require('../../models/customer-model');
const { authenticateQAToken } = require("../../../middlewares/qa-middleware");

router.get('/list',authenticateQAToken,(req,res)=>{
    let {page,search,status} = req.query;
    Task
    .find({
        status:1
    })
    .populate('job')
    .populate('level')
    .exec()
    .then(tasks=>{
        return res.status(200).json({
            msg:`Load tasks list successfully!`,
            tasks
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get tasks list with error: ${new Error(err.message)}`
        })
    })
})

router.get('/detail', authenticateQAToken, (req, res) => {
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
