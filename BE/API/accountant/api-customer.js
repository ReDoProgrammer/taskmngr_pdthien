const router = require('express').Router();
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");
const Customer = require("../../models/customer-model");
const Job = require('../../models/job-model');


router.get('/list',authenticateAccountantToken,async (req,res)=>{

})

router.post('/',authenticateAccountantToken,async (req,res)=>{
    let  {
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

      let chk = await Customer.countDocuments({'contact.email':email});
      if(chk > 0){
        return res.status(303).json({
            msg:`This email already exist in database!`
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
        address:address
     };
     customer.password = password;

     customer.style = {
        style_note:style_note,
        output:output,
        size:size,
        color:color,
        cloud:cloud,
        nation:nation,
        align:{
            is_align:is_align,
            align_note:align_note
        },
        tv:{
            has_TV:has_TV,
            TV_note:TV_note
        },
        grass:{
            has_grass:has_grass,
            grass_note:grass_note
        },
        sky:{
            has_sky:has_sky,
            sky_note:sky_note
        },
        fire:{
            has_fire:has_fire,
            fire_note:fire_note
        }
     };
     await customer.save()
     .then(_=>{
        return res.status(201).json({
            msg:`Customer has been added!`,
            url:'/accountant/customer'
        })
     })
     .catch(err=>{
        return res.status(500).json({
            msg:`Can not add new customer with error: ${new Error(err.message)}`
        })
     })
})

module.exports = router;



