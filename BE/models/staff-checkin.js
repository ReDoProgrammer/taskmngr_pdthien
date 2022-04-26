/*
    MODEL này quản lý trạng thái của nhân viên đang ở trong công ty hay không
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const checkInSchema = new Schema({
    staff:{
        type: Schema.Types.ObjectId,
        ref: 'user'       
    },
    online:{
        type:Boolean,
        default:true
    }
});


module.exports = mongoose.model('checkin',checkInSchema);