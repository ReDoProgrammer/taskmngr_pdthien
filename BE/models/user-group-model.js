require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//phân nhóm nhân viên: người nhà, người quen,...
const UserGroupSchema = new Schema({
    name:{
        type:String      
    },
    description:{
        type:String,
        default:''
    },
    wages:[{
        type:Schema.Types.ObjectId,
        ref:'wage'
    }]
});


module.exports = mongoose.model('user_group',UserGroupSchema);