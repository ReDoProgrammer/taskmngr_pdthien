/*
    model này dùng để lưu trữ các quyền truy cập module của từng user
*/
require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userModuleSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    module:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'module'
    },
    reg_task:{
        //thuộc tính đánh dấu khả năng có thể nhận thêm task của editor
        type:Boolean,
        default:false
      }    
});

userModuleSchema.index({ user: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('user_module',userModuleSchema);



