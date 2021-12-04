const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
  user_type:{
    type: Schema.Types.ObjectId,
    ref:'user_type'
  },
  username: { 
    type: String, 
    default: "", 
    unique: true,
    required: [true, 'Username can not be blank!']
  },
  password: { type: String, required:true },
  fullname: { type: String, required:true },
  idNo:{type:String,require:true},//số cmnd/cccd
  issued_by:{type:String,default:''},//ngày tạo tài khoản
  phone: { type: String, required:true },//số điện thoại
  email: { type: String, require: true , unique:true},//địa chỉ email
  address: { type: String, default: "" },//địa chỉ

  bank:{
    //tên ngân hàng
    type:String,   
    default:''
  },
  bank_no:{
    //số tài khoản ngân hàng
    type:String,
    default:''
  },
  bank_holder:{
    //tên chủ tài khoản
    type:String,
    default:''
  },
  is_admin:{
    //là quản trị viên
    type:Boolean,
    default:false
  },
  is_tla:{
    //là TLA
    type:Boolean,
    default:false
  },
  is_qa:{
    //là Q.A
    type:Boolean,
    default:false
  },
  is_dc:{
    //là DC
    type:Boolean,
    default:false
  },

  is_accountant:{
    //là kế toán
    type:Boolean,
    default:false
  },
  is_sale:{
    //là sale
    type:Boolean,
    default:false
  },

  is_editor:{
    //là editor
    type:Boolean,
    default:true
  }, 
  is_active:{
    //tài khoản đang hoạt động?
    type:Boolean,
    default:true
  }
});

UserSchema.pre("save", function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.ComparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model("user", UserSchema);
