const router = require('express').Router();
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");
const Customer = require("../../models/customer-model");
const Group = require('../../models/customer-group-model');

const pageSize = 20;

router.get('/contract', authenticateAccountantToken, async (req, res) => {
    let { customerId } = req.query;
    let customer = await Customer.findById(customerId)
        .populate('contracts.lines.parents')
        .populate('contracts.lines.root');
    if (!customer) {
        return res.status(404).json({
            msg: `Customer not found!`
        })
    }

    if (customer.contracts.length == 0) {
        return res.status(404).json({
            msg: `Customer contracts not found!`
        })
    }

    return res.status(200).json({
        msg: `Load contract detail successfully!`,
        contract: customer.contracts[customer.contracts.length - 1]
    })
})

router.get('/contracts', authenticateAccountantToken, async (req, res) => {
    let { customerId } = req.query;
    let contracts = await Customer.findById(customerId)
        .sort({ 'contracts.line.created.at': -1 })
        .populate('contracts.lines.created.by')
        .populate('contracts.lines.updated.by');

    if (!contracts) {
        return res.status(404).json({
            msg: `Customer contracts list not found!`
        })
    }

    return res.status(200).json({
        msg: `Load contracts list of customer successfully!`,
        contracts
    })


})

router.get('/detail', authenticateAccountantToken, async (req, res) => {
    let { customerId } = req.query;
    let customer = await Customer.findById(customerId);
    if (!customer) {
        return res.status(404).json({
            msg: `Customer not found!`
        })
    }
    return res.status(200).json({
        msg: `Load customer detail successfully!`,
        customer
    })
})

router.get('/list', authenticateAccountantToken, async (req, res) => {
    let { search, page, status } = req.query;

    let customers = await Customer.find({
        $or: [
            { "name.firstname": { "$regex": search, "$options": "i" } },
            { "name.lastname": { "$regex": search, "$options": "i" } },
            { "contact.email": { "$regex": search, "$options": "i" } },
            { "contact.phone": { "$regex": search, "$options": "i" } },
        ],
        status
    })

        .populate('contracts.lines.root')
        .populate('contracts.lines.parents')
        .sort({ '_id': 1 })
        .select('name.firstname name.lastname contact.phone contact.email status contracts')
        .skip((page - 1) * pageSize)
        .limit(pageSize);

    let count = await Customer.countDocuments({
        $or: [
            { "name.firstname": { "$regex": search, "$options": "i" } },
            { "name.lastname": { "$regex": search, "$options": "i" } },
            { "contact.email": { "$regex": search, "$options": "i" } },
            { "contact.phone": { "$regex": search, "$options": "i" } },
        ],
        status
    });

    return res.status(200).json({
        msg: `Load customers list successfully!`,
        customers,
        pages: count % pageSize == 0 ? count / pageSize : Math.floor(count / pageSize) + 1,
        pageSize
    });


})

router.post('/', authenticateAccountantToken, async (req, res) => {
    let {
        group,
        firstname,
        lastname,
        email,
        password,
        phone,
        address,
        output,
        size,
        color,
        is_align,
        align_note,
        cloud,
        nation,
        style_note,
        has_TV,
        TV_note,
        has_grass,
        grass_note,
        has_sky,
        sky_note,
        has_fire,
        fire_note,
        status
    } = req.body;


    let g = await Group.findById(group);
    if (!g) {
        return res.status(404).json({
            msg: `Customer group not found!`
        })
    }

    let chk = await Customer.countDocuments({ 'contact.email': email });
    if (chk > 0) {
        return res.status(303).json({
            msg: `This email already exist in database!`
        })
    }


    let customer = new Customer();

    customer.group = group;
    customer.created = {
        by: req.user._id,
        at: new Date()
    }

    customer.name = {
        firstname,
        lastname
    };
    customer.contact = {
        email: email,
        phone: phone,
        address: address
    };
    customer.password = password;

    customer.style = {
        style_note: style_note,
        output: output,
        size: size,
        color: color,
        cloud: cloud,
        nation: nation,
        align: {
            checked: is_align,
            note: align_note
        },
        tv: {
            checked: has_TV,
            note: TV_note
        },
        grass: {
            checked: has_grass,
            note: grass_note
        },
        sky: {
            checked: has_sky,
            note: sky_note
        },
        fire: {
            checked: has_fire,
            note: fire_note
        }
    };
    customer.status = status;
    await customer.save()
        .then(async _ => {
            g.customers.push(customer);
            await g.save()
                .then(_ => {
                    return res.status(201).json({
                        msg: `Customer has been created!`
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not add customer into group with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not add new customer with error: ${new Error(err.message)}`
            })
        })
})

router.put('/', authenticateAccountantToken, async (req, res) => {
    let {
        customerId,
        group,
        firstname,
        lastname,
        email,
        password,
        phone,
        address,
        output,
        size,
        color,
        is_align,
        align_note,
        cloud,
        nation,
        style_note,
        has_TV,
        TV_note,
        has_grass,
        grass_note,
        has_sky,
        sky_note,
        has_fire,
        fire_note,
        status
    } = req.body;

   
    let g = await Group.findById(group);
    if(!g){
        return res.status(404).json({
            msg:`Customer group not found!`
        })
    }

    let customer = await Customer.findById(customerId);

  

    if (!customer) {
        return res.status(404).json({
            msg: `Customer not found!`
        })
    }

    //xu ly khi group bi thay doi
    let exists = false;
    if(customer.group != group){
        let oGroup = await Group.findById(customer.group);
        oGroup.customers.pull(customer);
        await oGroup.save();   
        exists = true;   
    }

   
    customer.updated = {
        by: req.user._id,
        at: new Date()
    }

    customer.name = {
        firstname,
        lastname
    };
    customer.contact = {
        email: email,
        phone: phone,
        address: address
    };
    customer.password = password;

    customer.style = {
        style_note: style_note,
        output: output,
        size: size,
        color: color,
        cloud: cloud,
        nation: nation,
        align: {
            checked: is_align,
            note: align_note
        },
        tv: {
            checked: has_TV,
            note: TV_note
        },
        grass: {
            checked: has_grass,
            note: grass_note
        },
        sky: {
            checked: has_sky,
            note: sky_note
        },
        fire: {
            checked: has_fire,
            note: fire_note
        }
    };
    customer.status = status;
    await customer.save()
        .then(async _ => {  
            if(exists){
                g.customers.push(customer);
                await g.save()
                .then(_=>{
                    return res.status(201).json({
                        msg:`Customer has been updated!`
                    })
                })
                .catch(err=>{
                    return res.status(500).json({
                        msg:`Can not update customer with error: ${new Error(err.message)}`
                    })
                })
            }   else{
                return res.status(201).json({
                    msg: `Customer has been updated!`                   
                })
            }      
           
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not update customer with error: ${new Error(err.message)}`
            })
        })

})


router.put('/change-state', authenticateAccountantToken, async (req, res) => {
    let { customerId } = req.body;
    let customer = await Customer.findById(customerId);
    if (!customer) {
        return res.status(404).json({
            msg: `Customer not found!`
        })
    }

    customer.status = !customer.status;
    await customer.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Change customer status successfully!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not change customer status with error: ${new Error(err.message)}`
            })
        })
})

router.put('/contract', authenticateAccountantToken, async (req, res) => {
    let { contract } = req.body;

    let customer = await Customer.findById(contract.customer);
    if (!customer) {
        return res.status(404).json({
            msg: `Customer not found!`
        })
    }


    let c = {};

    let lines = await contract.lines.map(x => {
        let obj = {};
        if (x.child == 'true') {
            obj.parents = x.value;
        } else {
            obj.root = x.value;
        }
        obj.price = x.price;
        return obj;
    })

    c.lines = lines;
    c.created = {
        by: req.user._id,
        at: new Date()
    };

    customer.contracts.push(c);

    await customer.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Contract has been added!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not add contract with error: ${new Error(err.message)}`
            })
        })
})

router.delete('/', authenticateAccountantToken, async (req, res) => {
    let { customerId } = req.body;
    let customer = await Customer.findById(customerId);
    if (!customer) {
        return res.status(404).json({
            msg: `Customer not found!`
        })
    }

    if (customer.jobs.length > 0) {
        return res.status(303).json({
            msg: `Can not delete this customer when having jobs depend on it!`
        })
    }

    customer.delete()
        .then(_ => {
            return res.status(200).json({
                msg: `The customer has been deleted!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this customer with error: ${new Error(err.message)}`
            })
        })
})

module.exports = router;



