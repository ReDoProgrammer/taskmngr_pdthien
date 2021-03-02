const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('dotenv').config();



const skillSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String        
    }
    
});


module.exports = mongoose.model('skill',skillSchema);



