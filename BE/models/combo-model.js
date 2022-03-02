require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const comboSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String        
    },
    price:{
        type:Number,
        default:0
    }
    
});


module.exports = mongoose.model('combo',comboSchema);
