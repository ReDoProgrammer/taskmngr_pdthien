const router = require("express").Router();
const Job = require("../../models/job-model");
const Task = require('../../models/task-model');
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Material = require('../../models/material-model');
const Combo = require('../../models/combo-model');
const Customer = require('../../models/customer-model');
const Root = require('../../models/root-level-model');
const { ObjectId } = require('mongodb');

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
router.get('/detail', authenticateSaleToken, async (req, res) => {
  let { jobId } = req.query;
  let job = await Job.findById(jobId)
    .populate('customer');
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

router.get("/list", authenticateSaleToken, async (req, res) => {
  let { page, search } = req.query;

  let jobs = await Job
    .find({
      $or: [
        { "name": { "$regex": search, "$options": "i" } },
        { "intruction": { "$regex": search, "$options": "i" } }
      ]
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
    .populate('templates.root')
    .populate('templates.parents')
    .populate('customer')
    .populate('cb')
    .populate('created.by');
  return res.status(200).json({
    msg: `Load jobs depend on customer successfully!`,
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
      PullJob(job.customer, jobId)
        .then(_ => {
          return res.status(200).json({
            msg: `Job has been deleted!`
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
    price,
    urgent,
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
  } else {
    job.cb = null;
  }

  job.updated = {
    at: new Date(),
    by: req.user._id
  }

  if (material) {
    await Material.findById(material)
      .then(async m => {
        job.captured = {
          material,
          user: captureder,
          price: m.price,
          quantity
        }
      })
      .catch(err => {
        return res.status(500).json({
          msg: `Can not set captureder with material catch error: ${new Error(err.message)}`
        })
      })

  } else {
    job.captured = null;
  }
  job.urgent = urgent;

  await job.save()
    .then(_ => {
      ChangeTemplate(templates, job._id)
        .then(_ => {
          return res.status(200).json({
            msg: `The job has been updated!`
          })
        })
        .catch(err => {
          return res.status(err.code).json({
            msg: err.msg
          })
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
    price,
    templates,
    urgent
  } = req.body;


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

  if (material) {
    job.captured = {
      material,
      user: captureder,
      price,
      quantity
    }
  }

  if (cb.length > 0) {
    let c = await Combo.findById(cb);
    if (!c) {
      return res.status(404).json({
        msg: `Combo not found!`
      })
    }
    job.cb = cb;
  }



  job.created = {
    by: req.user._id,
    at: new Date()
  }

  job.urgent = urgent;


  await job.save()
    .then(async _ => {
      Promise.all([PushJob(job._id, customer), PushTemplate(templates, job._id)])
        .then(_ => {
          return res.status(201).json({
            msg: `Job has been created!`
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
        msg: `Can not created job with error: ${new Error(err.message)}`
      })
    })

});

module.exports = router;

const PushJob = (jobId, customerId) => {
  return new Promise(async (resolve, reject) => {
    let customer = await Customer.findById(customerId);
    if (!customer) {
      return reject({
        code: 404,
        msg: `Customer not found!`
      })
    }
    customer.jobs.push(jobId);
    await customer.save()
      .then(_ => {
        return resolve(customer);
      })
      .catch(err => {
        return reject({
          code: 500,
          msg: `Can not push job into customer with ${new Error(err.message)}`
        })
      })
  })
}

const PullJob = (customerId, jobId) => {
  return new Promise(async (resolve, reject) => {
    let customer = await Customer.findById(customerId);
    if (!customer) {
      return reject({
        code: 404,
        msg: `Customer not found!`
      })
    }
    customer.jobs.pull(jobId);
    await customer.save()
      .then(_ => {
        return resolve(customer)
      })
      .catch(err => {
        return reject({
          code: 500,
          msg: `Can not remove job from customer with error: ${new Error(err.message)}`
        })
      })
  })
}

const PushTemplate = (templates, jobId) => {
  return new Promise(async (resolve, reject) => {
    let job = await Job.findById(jobId);
    if (!job) {
      return reject({
        code: 404,
        msg: `Job not found!`
      })
    }
    if (templates.trim().length == 0) {
      return resolve();
    }
    let arr = templates.split(',');
    for (const temp of arr) {
      let count = await Root.countDocuments({ _id: ObjectId(temp.trim()) });
      if (count > 0) {
        job.templates.push({ root: ObjectId(temp.trim()) })
      } else {
        job.templates.push({ parents: ObjectId(temp.trim()) })
      }
    }

    await job.save()
      .then(_ => {
        return resolve(job)
      })
      .catch(err => {
        return reject({
          code: 500,
          msg: `Can not push template with error: ${new Error(err.message)}`
        })
      })
  })
}

const ChangeTemplate = (templates, jobId) => {
  return new Promise(async (resolve, reject) => {
    let job = await Job.findById(jobId);
    job.templates = [];
    if (templates.length > 0) {
      let temp = (templates.split(',')).map(x => x.trim());
      for (const t of temp) {
        let count = await Root.countDocuments({ _id: t });
        if (count > 0) {
          job.templates.push({ root: t })
        } else {
          job.templates.push({ parents: t })
        }
      }
    }

    await job.save()
      .then(_ => {
        return resolve(job);
      })
      .catch(err => {
        return reject({
          code: 500,
          msg: `Can not update job templates with error: ${new Error(err.message)}`
        })
      })


  })
}



