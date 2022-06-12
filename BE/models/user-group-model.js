require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//phân nhóm nhân viên: người nhà, người quen,...
const UserGroupSchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String,
        default: ''
    },   
    wages: [{
        module:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:'module'
        },
        staff_lv:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:'staff_level'
        },
        job_lv:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:'job_level'
        },        
        wage:{
            type:Number,
            default:0
        } 
        
    }]
});


module.exports = mongoose.model('user_group', UserGroupSchema);