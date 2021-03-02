require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const nationalStyleSchema = new Schema({
    name:{
        type:String
    },
    description:{
      type:String
       
    },
   

    
});


module.exports = mongoose.model('national_style',nationalStyleSchema);



