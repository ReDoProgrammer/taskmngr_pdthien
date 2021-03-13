const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
  username: { type: String, default: "", unique: true },
  password: { type: String, required:true },
  fullname: { type: String, required:true },
  idNo:{type:String,require:true},
  phone: { type: String, required:true },
  email: { type: String, require: true },
  address: { type: String, default: "" },
  group: {
    type: Schema.Types.ObjectId,
    ref: "user_group",
  },
  bank:{
    type:String,
    default:''
  },
  bank_no:{
    type:String,
    default:''
  },
  bank_name:{
    type:String,
    default:''
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
