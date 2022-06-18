const router = require("express").Router();
const Job = require("../../models/job-model");
const Task = require('../../models/task-model');
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Material = require('../../models/material-model');
const Combo = require('../../models/combo-model');
const Customer = require('../../models/customer-model');

const pageSize = 20;



router.get('/check-contract', authenticateSaleToken, async (req, res) => {
  let { customerId } = req.query;
  let customer = await Customer.findById(customerId);
  if (!customer) {
    return res.status(404).json({
      msg: `Customer not found!`
    })
  }
  if (customer.contracts.length == 0) {
    return res.status(303).json({
      msg: `Can not add job into this customer when contract has been not initialized. Please contact your administrator or accountant to set it!`
    })
  }
  return res.status(200).json({
    msg: `Job has been added!`,
    customer
  })
})
router.get('/detail', authenticateSaleToken, (req, res) => {
  let { jobId } = req.query;
  Job
    .findById(jobId)
    .populate('customer')
    .populate({ path: 'links', populate: ({ path: 'created_by', select: 'fullname' }) })
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

router.get("/list", authenticateSaleToken, async (req, res) => {
  let { page, search } = req.query;

  let jobs = await Job.find({
    $or: [
      { "name": { "$regex": search, "$options": "i" } },
      { "intruction": { "$regex": search, "$options": "i" } }
    ]
  })
    .populate('customer')
    .populate('captured.user')
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

});

router.get('/list-by-customer', authenticateSaleToken, async (req, res) => {
  let { custId } = req.query;
  let customer = await Customer.findById(custId);
  if (!customer) {
    return res.status(404).json({
      msg: `Customer not found!`
    })
  }

  let jobs = await Job.find({
    customer: custId
  })
  .populate('customer')
  .populate('cb')
  .populate('created.by');
  return res.status(200).json({
    msg:`Load jobs depend on customer successfully!`,
    jobs    
  })

})



router.delete('/', authenticateSaleToken, async (req, res) => {
  let { jobId } = req.body;
  let countTask = await Task.countDocuments({ 'basic.job': jobId });
  if (countTask > 0) {
    return res.status(403).json({
      msg: `Can not delete this job when having tasks based on it!`
    })
  }

  let job = await Job.findById(jobId);
  if (!job) {
    return res.status(500).json({
      msg: `Job not found!`
    })
  }

  let customer = await Customer.findById(job.customer);
  if (!customer) {
    return res.status(404).json({
      msg: `Can not found customer that this job belongs to`
    })
  }

  await job.delete()
    .then(async _ => {
      customer.jobs.pull(job);
      await customer.save()
        .then(_ => {
          return res.status(200).json({
            msg: `Job has been deleted!`
          })
        })
        .catch(err => {
          return res.status(500).json({
            msg: `Can not pull job from jobs list of customer with error: ${new Error(err.message)}`
          })
        })

    })
    .catch(err => {
      return res.status(500).json({
        msg: `Can not delete this job with error: ${new Error(err.message)}`
      })
    })
})

router.put("/", authenticateSaleToken, async (req, res) => {
  let {
    jobId,
    name,
    input_link,
    received_date,
    delivery_date,
    intruction,
    cb,
    material,
    captureder,
    quantity,
    templates
  } = req.body;


  let job = await Job.findById(jobId);
  if (!job) {
    console.log(`Job not found`)
    return res.status(404).json({
      msg: `Job not found`
    })
  }

  job.name = name;
  job.deadline = {
    begin: received_date,
    end: delivery_date
  }
  job.intruction = intruction;
  job.link.input = input_link;

  if (cb.length > 0) {
    let combo = await Combo.findById(cb);
    if (!combo) {
      console.log(`Combo not found!`)
      return res.status(404).json({
        msg: `Combo not found!`
      })
    }
    job.cb = cb;
  }

  job.udpated = {
    at: new Date(),
    by: req.user._id
  }

  if (material.length > 0) {
    let mat = await Material.findById(material);
    if (!mat) {
      console.log(`Material not found!`)
      return res.status(404).json({
        msg: `Material not found!`
      })
    }
    job.captured = {
      material,
      user: captureder,
      price: mat.price,
      quantity: quantity.length > 0 ? parseInt(quantity) : 0
    }
  }

  if (templates.length == 0) {
    job.templates = [];
  } else {
    let arr = templates.split(',');
    arr = arr.map(x => x.trim());
    job.templates = arr;
  }


  await job.save()
    .then(_ => {
      return res.status(200).json({
        msg: `The job has been updated!`
      })
    })
    .catch(err => {
      console.log(`Can not update this job with error: ${new Error(err.message)}`)
      return res.status(500).json({
        msg: `Can not update this job with error: ${new Error(err.message)}`
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
    quantity,
    templates
  } = req.body;



  let cust = await Customer.findById(customer);
  if (!cust) {
    return res.status(404).json({
      msg: `Customer not found!`
    })
  }

  let job = new Job();
  job.customer = customer;
  job.name = name;
  job.intruction = intruction;
  job.link = {
    input: input_link
  };
  job.deadline = {
    begin: received_date,
    end: delivery_date
  };

  job.templates = templates;


  if (cb.length > 0) {
    let c = await Combo.findById(cb);
    if (!c) {
      return res.status(404).json({
        msg: `Combo not found!`
      })
    }
    job.cb = cb;
  }

  if (material.length > 0) {
    let m = await Material.findById(material);
    if (!m) {
      return res.status(404).json({
        msg: `Material not found!`
      })
    }
    job.captured = {
      material,
      user: captureder,
      price: m.price,
      quantity: quantity.length == 0 ? 0 : parseInt(quantity)
    }
  }

  job.created = {
    by: req.user._id,
    at: new Date()
  }

  await job.save()
    .then(async _ => {
      cust.jobs.push(job);
      await cust.save()
        .then(_ => {
          return res.status(201).json({
            msg: `Job has been created!`
          })
        })
        .catch(err => {
          return res.status(500).json({
            msg: `Can not push this job into customer with error: ${new Error(err.message)}`
          })
        })
    })
    .catch(err => {
      return res.status(500).json({
        msg: `Can not created job with error: ${new Error(err.message)}`
      })
    })

});

module.exports = router;





