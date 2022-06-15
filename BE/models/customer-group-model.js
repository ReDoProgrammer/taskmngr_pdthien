const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const customerGroupSchema = new Schema({
    name:{
        type:String,
        require
    },
    description:{
        type:String
    },
    comboes:[{
        type:Schema.Types.ObjectId,
        ref:'combo'
    }],
    customers:[
        {
            type:Schema.Types.ObjectId,
            ref:'customer',            
        }
    ],
    created:{
        by:{
            type:Schema.Types.ObjectId,
            ref:'user'
        },
        at:{
            type:Date,
            default: new Date()
        }
    },
    updated:{
        at:{
            type:Date
        },
        by:{
            type:Schema.Types.ObjectId,
            ref:'user'
        }
    }
})
module.exports = mongoose.model('customer_group', customerGroupSchema);