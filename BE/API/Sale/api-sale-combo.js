const router = require('express').Router();
const Combo = require('../../models/combo-model');
const Group = require('../../models/customer-group-model');
const Customer = require('../../models/customer-model');
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");

router.get('/', authenticateSaleToken, async (req, res) => {
    let { customerId } = req.query;
    let customer = await Customer.findById(customerId);

    if (!customer) {
        return res.status(404).json({
            msg: `Customer not found!`
        })
    }

    let group = await Group.findById(customer.group);
    if (!group) {
        return res.status(404).json({
            msg: `Customer group not found!`
        })
    }

    let cbIds = group.comboes;
    let comboes = await Combo.find({
        _id: { $in: cbIds },
        $or:[
            {'applied.unlimited':true},
            {'applied.todate':{$gte:new Date()}}
        ]
    })
    .populate('lines.root')
    .populate('lines.parents');
   
    return res.status(200).json({
        msg:`Load comboes list successfully!`,
        comboes
    })
})

module.exports = router;