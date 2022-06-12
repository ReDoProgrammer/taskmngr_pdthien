const router = require('express').Router();
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");
const Customer = require("../../models/customer-model");
const Job = require('../../models/job-model');

const pageSize = 20;


router.get('/detail', authenticateAccountantToken, async (req, res) => {
    let { customerId } = req.query;
    let customer = await Customer.findById(customerId);
    if (!customer) {
        return res.status(404).json({
            msg: `Customer not found!`
        })
    }
    return res.status(200).json({
        msg:`Load customer detail successfully!`,
        customer
    })
})

router.get('/list', authenticateAccountantToken, async (req, res) => {
    let { search, page,status } = req.query;

    let customers = await Customer.find({
        $or: [
            { "name.firstname": { "$regex": search, "$options": "i" } },
            { "name.lastname": { "$regex": search, "$options": "i" } },
            { "contact.email": { "$regex": search, "$options": "i" } },
            { "contact.phone": { "$regex": search, "$options": "i" } },
        ],
        status
    })
        .sort({ _id: 1 })
        .select('name.firstname name.lastname contact.phone contact.email status')
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
        pages: count%pageSize==0?count/pageSize:Math.floor(count/pageSize)+1,
        pageSize
    });


})

router.post('/', authenticateAccountantToken, async (req, res) => {
    let {
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
        fire_note

    } = req.body;

    console.log({
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
        fire_note

    })

    let chk = await Customer.countDocuments({ 'contact.email': email });
    if (chk > 0) {
        return res.status(303).json({
            msg: `This email already exist in database!`
        })
    }


    let customer = new Customer();
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
            is_align: is_align,
            align_note: align_note
        },
        tv: {
            has_TV: has_TV,
            TV_note: TV_note
        },
        grass: {
            has_grass: has_grass,
            grass_note: grass_note
        },
        sky: {
            has_sky: has_sky,
            sky_note: sky_note
        },
        fire: {
            has_fire: has_fire,
            fire_note: fire_note
        }
    };
    await customer.save()
        .then(_ => {
            return res.status(201).json({
                msg: `Customer has been added!`,
                url: '/accountant/customer'
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not add new customer with error: ${new Error(err.message)}`
            })
        })
})

router.put('/change-state',authenticateAccountantToken,async (req,res)=>{
    let {customerId} = req.body;
    let customer = await Customer.findById(customerId);
    if(!customer){
        return res.status(404).json({
            msg:`Customer not found!`
        })
    }

    customer.status = !customer.status;
    await customer.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Change customer status successfully!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not change customer status with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;



