const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const queueSchema = new Schema({
    staff:{//id của editor đã đăng ký nhận job
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    timestamp:{//thời gian mà editor đã đăng kí nhận job
        type: Date,
        default: Date.now
    }   
    
});

module.exports = mongoose.model('queue',queueSchema);