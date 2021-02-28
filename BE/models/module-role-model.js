require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const moduleRoleSchema = new Schema({
    module:{
        type:Schema.Types.ObjectId,
        ref:'module'
    },
    role:{
        type:Schema.Types.ObjectId,
        ref:'role'
    },
    group:{
        type:Schema.Types.ObjectId,
        ref:'user_group'
    },
    status:{
        type:Boolean,
        default:false
    }

    
});


module.exports = mongoose.model('module_role',moduleRoleSchema);



