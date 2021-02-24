const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const customerSchema = new Schema({
    firstname:{
        type:String      
    },
    middlename:{
        type:String
    },
    lastname:{
        type:String       
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String
    },
    
});


module.exports = mongoose.model('customer',customerSchema);
