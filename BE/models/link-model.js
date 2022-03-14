
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const linkSchema = new Schema({
    job:{
        type:Schema.Types.ObjectId,
        ref:'job'
    },
    url:{
        type:String,
        default:''
    },
    remark:{
        type:String,
        default:''
    },
    checked:{
        type:Boolean,
        default:true
    },
    created_at:{
        type:Date,
        default: new Date()
    },
    created_by:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    updated_at:{
        type:Date        
    },
    updated_by:{
        type:Schema.Types.ObjectId,
        ref:'user'
    }

    
});


module.exports = mongoose.model('link',linkSchema);
