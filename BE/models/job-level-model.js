require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/**
 * 
 * Model này dùng để khai báo các level ( loại hàng )
 * 
 */

const jobLevel = new Schema({
    name:{
        type:String,
        required: [true, 'Please input bank name']
    },
    description:{
        type:String,
        default:''
    }    
});


module.exports = mongoose.model('job-level',jobLevel);



