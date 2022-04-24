const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
  user_group: {
    /**
     * Lưu thông tin nhóm của nhân viên
     * Ví dụ: relationship, employee,golden member
     * 
     */
    type: Schema.Types.ObjectId,
    ref: 'user_group'
  },
  user_level: {
    /*
      Lưu trữ thông tin trình độ của nhân viên
      Ví dụ: Fresher, intership, junior...
    */
    type: Schema.Types.ObjectId,
    ref: 'staff_level'
  },
  username: {
    type: String,
    default: "",
    unique: true,
    required: [true, 'Username can not be blank!']
  },
  password: { type: String, required: true },
  fullname: { type: String, required: true },
  idNo: { type: String, require: true },//số cmnd/cccd
  issued_by: { type: String, default: '' },//ngày tạo tài khoản
  phone: { type: String, required: true },//số điện thoại
  email: { type: String, require: true, unique: true },//địa chỉ email
  address: { type: String, default: "" },//địa chỉ

  bank: {
    //tên ngân hàng
    type: String,
    default: ''
  },
  bank_no: {
    //số tài khoản ngân hàng
    type: String,
    default: ''
  },
  bank_holder: {
    //tên chủ tài khoản
    type: String,
    default: ''
  },


  is_active: {
    //tài khoản đang hoạt động?
    type: Boolean,
    default: true
  }

});

UserSchema.pre("save", function (next) {
  var user = this;



  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      // only hash the password if it has been modified (or is new)
      if (user.isModified("password")) {
        user.password = hash;
        return next();
      }

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
