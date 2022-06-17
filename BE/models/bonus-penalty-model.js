require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*

    Model này dùng để quản lý nguyên nhân phạt
*/
const bonusPenaltySchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    is_bonus: {
        type: Boolean,
        default: false
    },
    costs: {
        type: Number,
        default: 0
    },
    created: {
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        at: {
            type: Date,
            default: new Date()
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
    }


});

module.exports = mongoose.model('bonus_penalty', bonusPenaltySchema);