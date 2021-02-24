const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const staffSchema = new Schema({
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
    address:{
        type:String
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    IDNumber:{
        type:String
    }
    
});


module.exports = mongoose.model('staff',staffSchema);
