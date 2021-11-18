require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const taskSchema = new Schema({
   job:{
       type:Schema.Types.ObjectId,
       ref:'job'
   },
   editor:{
    type:Schema.Types.ObjectId,
    ref:'user'
   },
   qa:{
    type:Schema.Types.ObjectId,
    ref:'user'
   },
   name:{
    type:String,
    default:''
   },
   level:{
    type:Schema.Types.ObjectId,
    ref:'level'
   },
   assigned_date:{
       type:Date,
       default:Date.now()
   },
   deadline:{
       type:Date
   },
   status:{
       type: Number,
       default:-1
       /*
            -1: editor nhận
            0: Editor đang xử lý
            1: editor done
            2: QA ok
            -2: qc reject
            3: DC ok => Job done
            -3: DC reject
       */
   },
   message:{
       type:String,
       default:''
   },
   edited_time:{
       type:Number,
       default:0
   }

});


module.exports = mongoose.model('task',taskSchema);



