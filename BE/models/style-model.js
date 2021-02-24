const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const styleSchema = new Schema({
    key:{
        type:String,
        required:true
    },
    value:{
        type:String,
        required:true
    }
    
});


module.exports = mongoose.model('style',styleSchema);



