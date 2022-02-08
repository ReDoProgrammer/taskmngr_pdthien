require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
  Model này định nghĩa cho các style theo quốc gia
  Ví dụ: Nauy style,US Style,...
*/
const nationalStyleSchema = new Schema({
    name:{
        type:String
    },
    description:{
      type:String
       
    } 
});


module.exports = mongoose.model('national_style',nationalStyleSchema);



