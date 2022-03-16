const router = require("express").Router();
const Job = require("../../models/job-model");
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


