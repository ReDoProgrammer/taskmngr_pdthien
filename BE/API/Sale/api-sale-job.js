const router = require("express").Router();
const Job = require("../../models/job-model");
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");

router.get("/list", authenticateSaleToken,(req, res) => {
  let {page,search} = req.query;
  console.log({page,search});
  Job.find({})
    .populate("customer", "firstname lastname -_id")
    .exec()
    .then((jobs) => {
      console.log(jobs);
      return res.status(200).json({
        msg: "load jobs list successfully",
        jobs: jobs,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        msg: "Can not load jobs list",
        error: new Error(err.message),
      });
    });
});

router.post("/",authenticateSaleToken, (req, res) => {
  let {   
    customer,
    name,
    source_link,
    received_date,
    delivery_date,
    intruction,
  } = req.body;

  console.log('job name: ',name);
  //validation
  if (source_link.trim().length == 0) {
    return res.status(403).json({
      msg: "Source link can not be blank",
    });
  }
  if (received_date.trim().length == 0) {
    return res.status(403).json({
      msg: "Receive date can not be blank",
    });
  }
  if (received_date.trim().length == 0) {
    return res.status(403).json({
      msg: "received date can not be blank",
    });
  }

  if (delivery_date.trim().length == 0) {
    return res.status(403).json({
      msg: "delivery date can not be blank",
    });
  }

  Promise.all([strToDate(received_date), strToDate(delivery_date)])
    .then((result) => {
      let d1 = result[0];
      let d2 = result[1];
      if (d1 >= d2) {
        return res.status(403).json({
          msg: "Receive date can not later than delivery date",
        });
      }
      let job = new Job({
        name,
        customer,
        source_link,
        received_date:d1,
        delivery_date:d2,
        intruction,
      });
      job
        .save()
        .then((j) => {
          return res.status(201).json({
            msg: "Create a new job successfully",
            job: j,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({
            msg: "Cannot create new job",
            error: new Error(err.message),
          });
        });
    })
    .catch((err) => {
      return res.status(403).json({
        msg: new Error(err.message),
      });
    });
});

module.exports = router;

var strToDate = (dtStr) => {
  return new Promise((resolve, reject) => {
    try {
      let dateParts = dtStr.split("/");
      let timeParts = dateParts[2].split(" ")[1].split(":");
      dateParts[2] = dateParts[2].split(" ")[0];
      return resolve(
        new Date(
          +dateParts[2],
          dateParts[1] - 1,
          +dateParts[0],
          timeParts[0],
          timeParts[1],
          00
        )
      );
    } catch (error) {
      console.log(error);
      return reject(new Error("Datetime format not match"));
    }
  });
};
