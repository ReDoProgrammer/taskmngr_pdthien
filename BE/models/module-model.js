/*
    Module này dùng để quản lý các module của web như: module Admin, module TLA, module của Sale, ...

*/
require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const moduleSchema = new Schema({
    name:{
        type:String       
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
    }    
    
});


module.exports = mongoose.model('module',moduleSchema);



