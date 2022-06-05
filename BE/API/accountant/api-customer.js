const router = require('express').Router();
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");
const Customer = require("../../models/customer-model");
const Job = require('../../models/job-model');



module.exports = router;



