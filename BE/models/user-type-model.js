require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userTypeSchema = new Schema({
    name:{
        type:String      
    },
    description:{
        type:String,
        default:''
    },
    wages:[{
        type:Schema.Types.ObjectId,
        ref:'wage'
    }]
});


module.exports = mongoose.model('user_type',userTypeSchema);