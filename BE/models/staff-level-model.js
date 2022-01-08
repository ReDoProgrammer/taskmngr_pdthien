require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const StaffLevelSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },   
    users:[{
        type:Schema.Types.ObjectId,
        ref:'user'
    }]   
    
});


module.exports = mongoose.model('staff_level',StaffLevelSchema);



