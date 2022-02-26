const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const queueSchema = new Schema({
    staff:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    timestamp:{
        type: Date,
        default: Date.now
    }   
    
});

module.exports = mongoose.model('queue',queueSchema);