/*
    Module này dùng để quản lý các module của web như: module Admin, module TLA, module của Sale, ...

*/
require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const moduleSchema = new Schema({
    name:{
        type:String  ,
        unique:true     
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    appling_wage:{
        type:Boolean,
        default:false
    },
    users:[
        {
            type:Schema.Types.ObjectId,
            ref:'user'
        }
    ]    
    
});


module.exports = mongoose.model('module',moduleSchema);



