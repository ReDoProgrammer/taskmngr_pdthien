require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const levelSchema = new Schema({
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
    },
    customer:[{
        type:Schema.Types.ObjectId,
        ref:'customer_level'
    }]   
    
});


module.exports = mongoose.model('level',levelSchema);



