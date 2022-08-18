require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/**
 * 
 * Model này dùng để quản lý chi tiết công việc, liên quan giữa job level của khách hàng 
 * và local level cũng như đơn giá được lấy từ contract
 */

const jobLineSchema = new Schema({
    job:{
        type:Schema.Types.ObjectId,
        ref:'job'
    },
    level:{
        type:Schema.Types.ObjectId,
        ref:'mapping'
    },
    price:{
        type:Number,
        min: [0, 'Price is invalid!'],
    },
    tasks:[
        {
            type:Schema.Types.ObjectId,
            ref:'task'
        }
    ]
});


module.exports = mongoose.model('job_line',jobLineSchema);



