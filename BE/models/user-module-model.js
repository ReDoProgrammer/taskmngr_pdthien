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
    }    
});

userModuleSchema.index({ user: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('user-module',userModuleSchema);



