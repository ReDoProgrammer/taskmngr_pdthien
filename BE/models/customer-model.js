require('dotenv').config();
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;


const customerSchema = new Schema({
    firstname:{
        type:String      
    },    
    lastname:{
        type:String       
    },    
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{

    },
    phone:{
        type:String
    },
    address:{
        type:String
    },
   
    output:{
        type:Schema.Types.ObjectId,
        ref:'file_format'
    },
    size:{
        type:Schema.Types.ObjectId,
        ref:'size'
    },
    color:{
        type:Schema.Types.ObjectId,
        ref:'color_mode'
    },
    is_align:{
        type:Boolean,
        default:false
    },
    align_note:{
        type:String,
        default:''
    },
    cloud:{
        type:Schema.Types.ObjectId,
        ref:'cloud'
    },
    nation:{
        type:Schema.Types.ObjectId,
        ref:'national_style'
    },
    remark:{
        type:String,
        default:''
    },
    has_TV:{
        type:Boolean,
        default:false
    },
    TV_note:{
        type:String,
        default:''
    },
    has_grass:{
        type:Boolean,
        default:false
    },
    grass_note:{
        type:String,
        default:''
    },
    has_sky:{
        type:Boolean,
        default:false
    },
    sky_note:{
        type:String,
        default:''
    },
    has_fire:{
        type:Boolean,
        default:false
    },
    fire_note:{
        type:String,
        default:''
    },
    levels:[{
        type:Schema.Types.ObjectId,
        ref:'customer_level'
    }],
    status:{//trạng thái hoạt động của khách hàng
        type:Boolean,
        default:true
    }, 

    jobs:[
        {
            type:Schema.Types.ObjectId,
            ref:'job'
        }
    ]  
});

customerSchema.pre("save", function (next) {
    var customer = this; 
  
  
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
      if (err) return next(err);
  
      // hash the password using our new salt
      bcrypt.hash(customer.password, salt, function (err, hash) {
        if (err) return next(err);
  
        // only hash the password if it has been modified (or is new)
        if (customer.isModified("password")) {
          customer.password = hash;
          return next();
        }
  
        // override the cleartext password with the hashed one
        customer.password = hash;
        next();
      });
    });
  });
  
  customerSchema.methods.ComparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
    });
  };


module.exports = mongoose.model('customer',customerSchema);
