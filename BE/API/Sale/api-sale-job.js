const router = require("express").Router();
const Job = require("../../models/job-model");
const Task = require('../../models/task-model');
const Remark = require('../../models/remark-model');
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");


router.get('/detail', authenticateSaleToken, (req, res) => {
  let { jobId } = req.query;
  Job
    .findById(jobId)
    .populate('customer')
    .populate({path:'links',populate:({path:'created_by',select:'fullname'})})  
    .exec()
    .then(job => {
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
    .catch(err => {
      return res.status(500).json({
        msg: `Can not get job detail by id with error: ${new Error(err.message)}`
      })
    })
})

router.get("/list", authenticateSaleToken, (req, res) => {
  let { page, search } = req.query;


  Job.find({
    $or: [
      { name: { "$regex": search, "$options": "i" } }
    ]
  })
    .populate({
      path: 'customer',

      // match: {
      //   $or: [
      //     { firstname: { "$regex": search, "$options": "i" } }
      //   ]
      // }

    })
    .populate('cb')
    .populate({path:'links',populate:({path:'created_by',select:'fullname'})})  
    .exec()
    .then((jobs) => {
      let result = jobs.slice(process.env.PAGE_SIZE * (page - 1), process.env.PAGE_SIZE);
      return res.status(200).json({
        msg: 'Load jobs list successfully!',
        pages: jobs.length % process.env.PAGE_SIZE == 0 ? jobs.length / process.env.PAGE_SIZE : Math.floor(jobs.length / process.env.PAGE_SIZE) + 1,
        jobs: result
      })

    })
    .catch((err) => {
      return res.status(500).json({
        msg: "Can not load jobs list",
        error: new Error(err.message),
      });
    });
});

router.delete('/',authenticateSaleToken,(req,res)=>{
  let {jobId} = req.body;
  Task
  .countDocuments({
    job:jobId,
    status: {$ne: -1}
  },async (err,count)=>{   
    if(err){
      return res.status(500).json({
        msg:`Can not check tasks belong to this job with error: ${new Error(err.message)}`
      })
    }
    if(count>0){
      return res.status(403).json({
        msg:`Can not delete this job after processing!`
      })
    }
    let job = await Job.findById(jobId);
    if(!job){
      return res.status(404).json({
        msg:`Job not found!`
      })
    }

    await Promise.all([DeleteTasksBasedJob(jobId),DeleteRemarks(job.tasks)])
    .then(async _=>{
      Job.findByIdAndDelete(jobId,(err)=>{
        if(err){
          return res.status(500).json({
            msg:`Can not delete this job with error: ${new Error(err.message)}`
          })
        }
        return res.status(200).json({
          msg:`This job has been deleted!`
        })
      })
    })
    .catch(err=>{
      return res.status(err.code).json({
        msg:err.msg
      })
    })
    
  })
})

router.put("/", authenticateSaleToken, (req, res) => {
  let {
    jobId,   
    name,
    input_link,
    received_date,
    delivery_date,
    intruction,
    cb_ticked,
    cb
  } = req.body;

  Job
  .findByIdAndUpdate(jobId,
    {
      name,
      input_link,
      received_date,
      delivery_date,
      intruction,
      cb_ticked,
      cb
    },{new:true},(err,job)=>{
      if(err){
        return res.status(500).json({
          msg:`Can not update job by id with error: ${new Error(err.message)}`
        })
      }

      if(!job){
        return res.status(404).json({
          msg:`Job not found!!`
        })
      }

      return res.status(200).json({
        msg:`Update job successfully!`,
        job
      })
    })
 
  
});


router.post("/", authenticateSaleToken, (req, res) => {
  let {
    customer,
    name,
    input_link,
    received_date,
    delivery_date,
    intruction,
    cb_ticked,
    cb
  } = req.body;


  let job = new Job({
    name,
    customer,
    input_link,
    received_date,
    delivery_date,
    intruction,
    cb_ticked,
    cb
  });
  job
    .save()
    .then((j) => {
      return res.status(201).json({
        msg: "Create a new job successfully",
        j
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        msg: "Cannot create new job",
        error: new Error(err.message),
      });
    });

});

module.exports = router;

const DeleteTasksBasedJob = (jobId)=>{
  return new Promise((resolve,reject)=>{
    Task
    .deleteMany({job:jobId},err=>{
      if(err){
        return reject({
          code:500,
          msg:`Can not delete tasks belongs to this job with error: ${new Error(err.message)}`
        })
      }
      return resolve();
    })
  })
}

const DeleteRemarks = (taskIds)=>{
  return new Promise((resolve,reject)=>{
    Remark
    .deleteMany({ids:{$in: taskIds}},(err)=>{
      if(err){
        return reject({
          code:500,
          msg:`Can not delete remarks belong to this job with error: ${new Error(err.message)}`
        })
      }
      return resolve();
    })
  })
}




