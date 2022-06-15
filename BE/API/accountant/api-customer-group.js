const router = require('express').Router();
const CustomerGroup = require('../../models/customer-group-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");


router.get('/', authenticateAccountantToken,async (req, res) => {
    let groups = await CustomerGroup.find({});
    return res.status(200).json({
        msg:`Load customer groups successfully!`,
        groups
    })
   
})


module.exports = router;