require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const bankSchema = new Schema({
    name:{
        type:String,
        required: [true, 'Please input bank name']
    },
    description:{
        type:String,
        default:''
    }    
});


module.exports = mongoose.model('bank',bankSchema);



