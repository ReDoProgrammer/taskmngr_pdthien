require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const jobSchema = new Schema({
   customer:{
       type:Schema.Types.ObjectId,
       ref:'customer'
   },
   name:{
    type:String,
    default:''
   },
   source_link:{
       type:String,
       require:[true,'Source link can not be blank']
   },
   receive_date:{
       type:Date,
       require:true
   },
   deadline:{
       type:Date,
       require:true
   },
   intruction:{
       type:String,
       default:''
   },
   status:{
       type:Number,
       default:-1
   }

});


module.exports = mongoose.model('job',jobSchema);



