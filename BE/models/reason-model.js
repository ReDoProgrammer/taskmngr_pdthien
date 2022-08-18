require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const reasonSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    is_penalty:{
        type:Boolean,
        default:false
    },
    fines:{
        type:Number,
        default:0
    }
    
});


module.exports = mongoose.model('reason',reasonSchema);


