require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const jobSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String        
    },
    is_input:{
        type:Boolean,
        default:true
    }  
    
});


module.exports = mongoose.model('job',jobSchema);



