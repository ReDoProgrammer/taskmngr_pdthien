const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Job = require('../../models/job-model');
const Root = require('../../models/root-level-model');
const Parents = require('../../models/parents-level-model');
const LocalLevel = require('../../models/job-level-model');

const pageSize = 20;



router.get('/list', authenticateTLAToken, async (req, res) => {
    let { fromdate,todate,status,page, search } = req.query; 
  
    if(status.length == 0){
        return res.status(404).json({
            msg:`No available job status`,
            jobs:[]
        })
    }
    console.log(todate)
    status = status.map(x=>parseInt(x));
  
    let jobs = await Job
        .find({
            'deadline.begin':{$gte:fromdate},
            'deadline.end':{$lte:todate},
            $or: [
                { "name": { "$regex": search, "$options": "i" } },
                { "intruction": { "$regex": search, "$options": "i" } }
            ],
            status:{$in:status}
        })
        .populate([
            {
                path: 'customer',
                'name.firstname': {
                    $regex: '.*' + search + '.*'
                }
            },
            { path: 'cb' },
            { path: 'captured.user' },
            { path: 'tasks' },
            { path: 'templates.root' },
            { path: 'templates.parents' }
        ])
        .sort({ urgent: -1 })
        .sort({ 'deadline.end': 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize);     

    let count = await Job.countDocuments({
        $or: [
            { "name": { "$regex": search, "$options": "i" } },
            { "intruction": { "$regex": search, "$options": "i" } }
        ]
    });

    return res.status(200).json({
        msg: `Load jobs list successfully!`,
        jobs,
        pageSize,
        pages: count % pageSize == 0 ? count / pageSize : (Math.floor(count / pageSize) + 1)
    })
})

router.get('/list-cc', authenticateTLAToken, async (req, res) => {
    let { jobId } = req.query;
    let job = await Job.findById(jobId)
        .populate([
            { path: 'cc.root' },
            { path: 'cc.parents' }
        ]);
    if (!job) {
        return res.status(404).json({
            msg: `Job not found so can not load CC list`
        })
    }
    return res.status(200).json({
        msg: `Load cc list based on job successfully!`,
        cc: job.cc
    })

})


router.get('/list-tasks', authenticateTLAToken, async (req, res) => {
    let { jobId } = req.query;
    let job = await Job.findById(jobId)
        .populate([
            {
                path: 'root.ref',
                select: 'name'
            },
            {
                path: 'root.tasks',
                populate: [
                    { path: 'basic.level' },
                    { path: 'editor.staff' },
                    { path: 'qa.staff' },
                    { path: 'dc.staff' },
                    { path: 'tla.uploaded.by' },
                ]
            },
            {
                path: 'parents.ref',
                select: 'name'
            },
            {
                path: 'parents.tasks',
                populate: [
                    { path: 'basic.level' },
                    { path: 'editor.staff' },
                    { path: 'qa.staff' },
                    { path: 'dc.staff' },
                    { path: 'tla.uploaded.by' },
                ]
            }
        ]);
    if (!job) {
        return res.status(404).json({
            msg: `Can not list task belong to job cause job not found!`
        })
    }

    return res.status(200).json({
        msg: `List tasks based on job successfully!`,
        job
    })
})

router.get('/detail', authenticateTLAToken, async (req, res) => {

    let { jobId } = req.query;
    let job = await Job.findById(jobId)
        .populate([
            { path: 'created.by', select: 'username fullname' },
            { path: 'customer' },
            {
                path: 'cb',
                populate: ([
                    { path: 'lines.root' },
                    { path: 'lines.parents' }
                ])
            },
            { path: 'cc.root' },
            { path: 'cc.root.tasks' },
            { path: 'cc.parents' },
            { path: 'cc.parents.tasks' },
            { path: 'captured.material' },
            { path: 'captured.user' },
            { path: 'templates.root' },
            { path: 'templates.parents' },
            { path: 'root.ref' },
            { path: 'root.tasks' },
            { path: 'parents.ref' },
            { path: 'parents.tasks' }
        ]);


    if (!job) {
        return res.status(404).json({
            msg: `Job not found!`
        })
    }

    return res.status(200).json({
        msg: `Get job detail successfully!`,
        job
    })
})

router.get('/local-level', authenticateTLAToken, async (req, res) => {
    let { customer_level, is_root } = req.query;
    let levels = [];

    if (is_root == 'true') {
        let root = await Root.findById(customer_level)
            .populate({
                path: 'parents',
                populate: {
                    path: 'job_levels'
                }
            });

        if (root) {
            root.parents.forEach(p => {
                p.job_levels.forEach(l => {
                    const isFound = levels.some(x => {
                        if (x._id == l._id) {
                            return true;
                        }
                        return false;
                    })
                    if (!isFound) {
                        levels.push({
                            _id: l._id,
                            name: l.name
                        })
                    }
                })

            })
            return res.status(200).json({
                msg: `Load local levels successfully!`,
                levels
            })
        }

    } else {
        let parents = await Parents.findById(customer_level).populate('job_levels');
        if (parents) {
            levels = parents.job_levels.map(x => {
                let obj = {};
                obj._id = x._id;
                obj.name = x.name;
                return obj;
            })
            return res.status(200).json({
                msg: `Load local levels successfully!`,
                levels
            })
        }
    }



})

router.put('/submit', authenticateTLAToken, (req, res) => {
    let { jobId, link, remark } = req.body;

    Job
        .findById(jobId)
        .exec()
        .then(async job => {
            if (!job) {
                return res.status(404).json({
                    msg: `Job not found!`
                })
            }

            let lnk = new Link({
                job: job._id,
                url: link,
                remark,
                created_by: req.user._id
            });
            await lnk
                .save()
                .then(async l => {
                    job.links.push(l);
                    job.status = 1;
                    await job.save()
                        .then(_ => {
                            return res.status(200).json({
                                msg: `The job has been uploaded successfully!`
                            })
                        })
                        .catch(err => {
                            return res.status(500).json({
                                msg: `Can not stored link into job with error: ${new Error(err.message)}`
                            })
                        })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not save link with error: ${new Error(err.mesage)}`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get job with error: ${new Error(err.message)}`
            })
        })


})



module.exports = router;




