const router = require("express").Router();
const Job = require("../../models/job-model");
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");

router.get("/list", authenticateSaleToken, (req, res) => {
  let { page, search } = req.query;


  Job.find({
    $or: [
      { name: { "$regex": search, "$options": "i" } }
    ]
  })
    .populate({
      path: 'customer',

      match: {
        $or: [
          { firstname: { "$regex": search, "$options": "i" } }
        ]
      }

    })

    .exec()
    .then((jobs) => {
      let result = jobs.slice(process.env.PAGE_SIZE * (page - 1), process.env.PAGE_SIZE);
      console.log(result);
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

router.post("/", authenticateSaleToken, (req, res) => {
  let {
    customer,
    name,
    source_link,
    received_date,
    delivery_date,
    intruction,
  } = req.body;


  let job = new Job({
    name,
    customer,
    source_link,
    received_date,
    delivery_date,
    intruction,
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


