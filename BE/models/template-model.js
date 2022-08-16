require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const templateSchema = new Schema({
    name:{
        type:String,
        default:'Tmp'
    },
    description:{
        type:String
    },
    levels:[
        {
            type:Schema.Types.ObjectId,
            ref:'mapping'
        }
    ],
    created:{
        at:{
            type:Date,
            default:new Date()
        },
        at:{
            type:Schema.Types.ObjectId,
            ref:'user'
        }
    },
    updated:{
        at: {type:Date},
        by:{
            type:Schema.Types.ObjectId,
            ref:'user'
        }
    }
});




module.exports = mongoose.model('template', templateSchema);





