const router = require("express").Router();
const Job = require("../../models/job-model");
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.post("/", (req, res) => {
  let {
    customerId,
    source_link,
    receive_date,
    deadline,
    intruction,
  } = req.body;

  //validation
  if (source_link.trim().length == 0) {
    return res.status(403).json({
      msg: "Source link can not be blank",
    });
  }
  if (receive_date.trim().length == 0) {
    return res.status(403).json({
      msg: "Receive date can not be blank",
    });
  }
  if (deadline.trim().length == 0) {
    return res.status(403).json({
      msg: "Deadline can not be blank",
    });
  }

  Promise.all([strToDate(receive_date), strToDate(deadline)])
    .then((result) => {
      let d1 = result[0];
      let d2 = result[1];
      if (d1 >= d2) {
        return res.status(403).json({
          msg: "Receive date can not later than deadline",
        });
      }
      let job = new Job({
        customer: customerId,
        source_link:source_link,
        receive_date:d1,
        deadline:d2,
        intruction:intruction,
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
