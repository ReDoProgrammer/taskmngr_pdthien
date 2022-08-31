require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*

    Model này dùng để quản lý cc
*/
const ccSchema = new Schema({
    job: {
        type: Schema.Types.ObjectId,
        ref: 'job'
    },

    root: {
        type: Schema.Types.ObjectId,
        ref: 'mapping'
    },
    remark: {
        type: String
    },
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'task'
    }],
    fee: {
        type: Boolean
    },
    requested: {
        at: {
            type: Date,
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'customer'
        }
    },
    created: {
        at: {
            type: Date
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    updated: {
        at: {
            type: Date
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    status: {
        /*
            -1: initial
            0: processing
           1: Done

        */
        type: Number,
        default: -1
    }


});

module.exports = mongoose.model('cc', ccSchema);