const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Task = require('../../models/task-model');
const moment = require('moment');

router.get('/list', authenticateTLAToken, (req, res) => {
    let { jobId } = req.query;
    Task
        .find({ job: jobId })
        .populate('staff', 'fullname')
        .exec()
        .then(tasks => {
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
        .populate('staff', 'fullname -_id')
        .populate('job','name')
        .exec()
        .then(tasks=>{
            return res.status(200).json({
                msg:'Load tasks list successfully!',
                tasks
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not load taks list with error: ${new Error(err.message)}`
            })
        })

})

router.get('/detail', authenticateTLAToken, (req, res) => {

})

router.post('/', authenticateTLAToken, (req, res) => {
    let { task } = req.body;
    task.forEach(t => {
        try {

            Task
                .countDocuments({ job: t.jobId, staff: t.user })
                .exec()
                .then(count => {
                    if (count == 0) {

                        let o = new Task({
                            job: t.jobId,
                            staff: t.user,
                            qa: t.is_qa,
                            editor: t.is_editor,
                            deadline: t.deadline,
                            assigned_date: t.assigned_date
                        });

                        o.save()
                            .then(_ => {
                                console.log('task has been created!');
                            })
                            .catch(err => {
                                console.log(`create a new task failed: ${new Error(err.message)}`);
                            })
                    }
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not check exist task by id: ${t.jobId} and user: ${t.user}`,
                        error: new Error(err.message)
                    })
                })

            return res.status(201).json({
                msg: 'Created tasks successfully!'
            })

        } catch (error) {
            return res.status(500).json({
                msg: `Create tasks failed with error: ${new Error(error.message)}`
            })

        }
    });
})

router.put('/', authenticateTLAToken, (req, res) => {

})

router.delete('/', authenticateTLAToken, (req, res) => {
    let { jobId, user } = req.body;
    Task.findOneAndDelete({
        job: jobId,
        staff: user
    })
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



function convertToDate(t) {
    t = (t + ':00').replace('\/', '-');
    console.log(t);
    return moment(t + ':00').replace('/', '-').format('DD-MMM-YYYY HH:mm:ss')
}

module.exports = router;