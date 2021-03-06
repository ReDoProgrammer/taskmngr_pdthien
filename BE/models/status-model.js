require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const statusSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }

    
});


module.exports = mongoose.model('status',statusSchema);



