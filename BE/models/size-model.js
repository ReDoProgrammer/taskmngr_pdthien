require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const sizeSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }  
    
});


module.exports = mongoose.model('size',sizeSchema);



