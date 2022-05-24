const router = require('express').Router();
const Task = require('../../models/task-model');
const { authenticateCustomerToken } = require("../../../middlewares/customer-middleware");

router.get('/',authenticateCustomerToken,(req,res)=>{
    
})

module.exports = router;