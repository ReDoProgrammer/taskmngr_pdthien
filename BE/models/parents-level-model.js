const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const parentsLevelSchema = new Schema({
    /*
      Model này dùng để quản lý các job level ở phía khách hàng
      ví dụ: Multiple, Single. Là level con của root level nếu khách hàng yêu cầu tách root level ra các level con
      dùng để mapping tới các joblevel ở phía khách hàng: DTE, BASIC..      
    */

      name:{
          type:String,
          required: true
      },
      description:{
          type:String,
          default:''
      },
      job_levels:[
          {
            type:Schema.Types.ObjectId,
            ref:'job-level'
          }
      ],
      root:{
          type: Schema.Types.ObjectId,
          ref:'root-level'
      }
    
});

module.exports = mongoose.model('parents-level',parentsLevelSchema);