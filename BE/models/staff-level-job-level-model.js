const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const staffLevelAndJobLevel = new Schema({
    staff_lv:{
        type: SchemaTypes.ObjectId,
        ref: 'staff_level'
       
    },
    job_lv:{
        type: SchemaTypes.ObjectId,
        ref: 'job_level'
    }    
});

staffLevelAndJobLevel.index({ staff_lv: 1, job_lv: 1 }, { unique: true });

module.exports = mongoose.model('staff_level_job_level',staffLevelAndJobLevel);



