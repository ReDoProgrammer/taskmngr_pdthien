require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userGroupSchema = new Schema({
    name:{
        type:String      
    },
    description:{
        type:String
    }    
});


module.exports = mongoose.model('user_group',userGroupSchema);