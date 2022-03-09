const router = require('express').Router();
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");
const Customer = require("../../models/customer-model");
const CustomerLevel = require('../../models/customer-level-model');
const Job = require('../../models/job-model');

router.delete("/", authenticateAccountantToken, (req, res) => {
  let { customerId } = req.body;

  //validate jobs based on customer
  Job
    .countDocuments({ status: { $gt: 1 } }, (err, count) => {
      if (err) {
        return res.status(500).json({
          msg: `Can not check jobs based on this customer`
        })
      }

      if (count > 0) {
        return res.status(403).json({
          msg: `Can not delete this customer becasuse there are jobs based on it!`
        })
      }

      Customer.findOneAndDelete({ _id: customerId }, (err, customer) => {
        if (err) {
          return res.status(500).json({
            msg: "Delete customer failed!",
            error: new Error(err.message),
          });
        }
        if (!customer) {
          return res.status(404).json({
            msg: "Customer not found!",
          });
        }

        return res.status(200).json({
          msg: "Customer has been deleted!",
        });

      });
    })


});

router.get("/list", authenticateAccountantToken, (req, res) => {
  let { search, page, status } = req.query;
  Customer.find({
    status,
    $or: [
      { firstname: { "$regex": search, "$options": "i" } },
      { lastname: { "$regex": search, "$options": "i" } },
      { phone: { "$regex": search, "$options": "i" } },
      { email: { "$regex": search, "$options": "i" } },
    ]
  })
    .select('firstname lastname phone email address status')
    .exec((err, customers) => {
      if (err) {
        return res.status(500).json({
          msg: 'Load customers failed',
          error: new Error(err.message)
        });
      }
      if (customers) {
        let result = customers.slice(process.env.PAGE_SIZE * (page - 1), process.env.PAGE_SIZE);
        return res.status(200).json({
          msg: 'Load customers successfully!',
          pages: customers.length % process.env.PAGE_SIZE == 0 ? customers.length / process.env.PAGE_SIZE : Math.floor(customers.length / process.env.PAGE_SIZE) + 1,
          result: result
        })
      } else {
        return res.status(500).json({
          error: 'Can not load customers!'
        });
      }
    });



});

router.get("/detail", authenticateAccountantToken, (req, res) => {
  let { customerId } = req.query;
  Customer.findById(customerId)
    .populate({
      path: 'levels',
      populate: { path: 'level' }
    })
    .populate('output', 'name')
    .populate('size', 'name')
    .populate('color', 'name')
    .populate('cloud', 'name')
    .populate('nation', 'name')
    .exec((err, customer) => {
      if (err) {
        return res.status(500).json({
          msg: "Can not get customer detail",
          error: new Error(err.message),
        });
      }
      if (customer) {
        return res.status(200).json({
          msg: "Get customer detail successfully!",
          customer: customer,
        });
      } else {
        return res.status(404).json({
          msg: "Customer not found!",
        });
      }
    });
});

router.post("/", authenticateAccountantToken, (req, res) => {
  let {
    firstname,
    lastname,
    password,
    phone,
    email,
    address,
    output,
    size,
    color,
    is_align,
    align_note,
    cloud,
    nation,
    remark,
    has_TV,
    TV_note,
    has_grass,
    grass_note,
    has_sky,
    sky_note,
    has_fire,
    fire_note,
    levels,
  } = req.body;

  //rang buoc du lieu



  if (firstname.trim().length == 0 && lastname.trim().length == 0) {
    return res.status(403).json({
      msg: 'Firstname and last name can not be empty'
    });
  }

  if (email.trim().length == 0) {
    return res.status(403).json({
      msg: 'Email can not be empty'
    })
  }

  if (password.trim().length == 0) {
    return res.status(403).json({
      msg: 'Password can blank!'
    })
  }


  if (typeof levels == 'undefined' || levels.length == 0) {
    return res.status(403).json({
      msg: "Level list can not be empty!",
    });
  }

  Customer.countDocuments({ email }, (err, count) => {
    if (err) {
      return res.status(500).json({
        msg: 'Can not create a new customer',
        error: new Error(err.message)
      });
    }

    if (count > 0) {
      return res.status(409).json({
        msg: 'Email already exist in database!'
      });
    } else {
      let customer = new Customer({
        firstname,
        lastname,
        password,
        phone,
        email,
        address,
        output,
        size,
        color,
        is_align,
        align_note,
        cloud,
        nation,
        remark,
        has_TV,
        TV_note,
        has_grass,
        grass_note,
        has_sky,
        sky_note,
        has_fire,
        fire_note
      });

      customer
        .save()
        .then((customer) => {
          insert_levels(levels, customer)
            .then(customer => {
              return res.status(201).json({
                msg: 'Insert customer succesfully!',
                customer,
                url: '/accountant/customer'
              })
            })
            .catch(err => {
              return res.status(500).json({
                msg: 'Insert customer failed',
                error: new Error(err.message)
              })
            })
        })
        .catch((err) => {
          return res.status(500).json({
            msg: "Create new customer failed",
            error: new Error(err.message),
          });
        });
    }
  })


});

router.put("/", authenticateAccountantToken, (req, res) => {
  let { customerId,
    firstname,
    lastname,
    password,
    phone,
    address,
    status,
    output,
    size,
    color,
    is_align,
    align_note,
    cloud,
    nation,
    remark,
    has_TV,
    TV_note,
    has_grass,
    grass_note,
    has_sky,
    sky_note,
    has_fire,
    fire_note
  } = req.body;





  Customer
    .findById(customerId)
    .exec()
    .then(customer => {
      if (!customer) {
        return res.status(404).json({
          msg: `Customer not found!`
        })
      }

      customer.firstname = firstname;
      customer.lastname = lastname;
      customer.password = password
      customer.phone = phone;
      customer.address = address;
      customer.status = status;
      customer.output = output;
      customer.size = size;
      customer.color = color;
      customer.is_align = is_align;
      customer.align_note = align_note;
      customer.cloud = cloud;
      customer.nation = nation;
      customer.remark = remark;
      customer.has_TV = has_TV;
      customer.TV_note = TV_note;
      customer.has_grass = has_grass;
      customer.grass_note = grass_note;
      customer.has_sky = has_sky;
      customer.sky_note = sky_note;
      customer.has_fire = has_fire;
      customer.fire_note = fire_note;

      customer.save()
        .then(_ => {
          return res.status(200).json({
            msg: `Update customer successfully!`,
            url: '/accountant/customer'
          })
        })
        .catch(err => {
          return res.status(500).json({
            msg: `Update customer info failed with error: ${new Error(err.message)}`
          })
        })

    })
    .catch(err => {
      return res.status(500).json({
        msg: `Can not get customer by id with error: ${new Error(err.message)}`
      })
    })


});


module.exports = router;



var insert_levels = (levels, customerId) => {
  return new Promise(async (resolve, reject) => {
    let obs = await levels.map(l => {
      var o = {};
      o.level = l.level;
      o.price = l.price;
      o.customer = customerId;
      return o;
    })

    CustomerLevel.insertMany(obs, async (err, cls) => {
      if (err) {
        return reject({
          msg: 'Insert customer levels failed',
          error: new Error(err.message)
        })
      }
      return resolve(cls);
    });
  })
}

