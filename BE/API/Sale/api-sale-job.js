const router = require("express").Router();
const Job = require("../../models/job-model");
const Task = require('../../models/task-model');
const Remark = require('../../models/remark-model');
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Material = require('../../models/material-model');
const Combo = require('../../models/combo-model');


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
    .populate('tasks')  
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
    'basic.job':jobId,
    status: {   
      $nin:[0,-1,-2,-3,-4,-5]//và không bị cancel,reject
    }
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


router.post("/", authenticateSaleToken, async (req, res) => {
  let {
    customer,
    name,
    input_link,
    received_date,
    delivery_date,
    intruction,   
    cb,
    material,
    captureder,
    quantity
  } = req.body;

  let job = new Job();
  job.customer = customer;
  job.name = name;
  job.link = {
    input: input_link
  };
  job.deadline = {
    begin: received_date,
    end: delivery_date 
  };

  if(cb.length > 0){
    let c = await Combo.findById(cb);
    if(!c){
      return res.status(404).json({
        msg:`Combo not found!`
      })
    }
    job.cb = cb;
  }

  if(material.length > 0){
    let m = await Material.findById(material);
    if(!m){
      return res.status(404).json({
        msg:`Material not found!`
      })
    }
    job.captured = {
      user: captureder,
      price:m.price,
      quantity: quantity.length == 0?0:parseInt(quantity)
    }
  }

  job.created = {
    by:req.user._id
  }

  await job.save()
  .then(_=>{
   return res.status(201).json({
     msg:`Job has been created!`
   })
  })
  .catch(err=>{
    return res.status(500).json({
      msg:`Can not created job with error: ${new Error(err.message)}`
    })
  })


  

});

module.exports = router;

const DeleteTasksBasedJob = (jobId)=>{
  return new Promise((resolve,reject)=>{
    Task
    .deleteMany({'basic.job':jobId},err=>{
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




