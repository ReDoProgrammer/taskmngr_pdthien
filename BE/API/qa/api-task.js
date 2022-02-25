const router = require("express").Router();
const Task = require("../../models/task-model");
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

module.exports = router;