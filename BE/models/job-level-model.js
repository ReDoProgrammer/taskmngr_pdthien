require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/**
 * 
 * Model này dùng để khai báo các level ( loại hàng )
 * Ví dụ: VIDEOS,PE-STAND,VHS,...
 */

const jobLevel = new Schema({
    name:{
        type:String,
        required: [true, 'Please input job level']
    },
    description:{
        type:String,
        default:''
    }    
});


module.exports = mongoose.model('job_level',jobLevel);



