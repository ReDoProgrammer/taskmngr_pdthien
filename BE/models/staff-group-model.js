const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffGroupSchema = new Schema({
    name:{
        type:String      
    },
    description:{
        type:String
    }    
});


module.exports = mongoose.model('staff_group',staffGroupSchema);