require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const comboSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        default: 0
    },
    applied:{
        from_date:{
            type:Date
        },
        to_date:{
            type: Date
        },
        unlimited:{
            type: Boolean,
            default: false
        },
        status:{
            type: Boolean,
            default: true
        }
    },
    lines: [
        {
           root:{
               type:Schema.Types.ObjectId,
               ref:'root_level'
           },
           parents:{
               type:Schema.Types.ObjectId,
               ref:'parents_level'
           },
           quantity:{
               type:Number,
               required: [true, 'Quantity is invalid!']
           }
        }
    ]

});


module.exports = mongoose.model('combo', comboSchema);
