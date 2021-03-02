require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const cloudSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String        
    }
    
});


module.exports = mongoose.model('cloud',cloudSchema);



