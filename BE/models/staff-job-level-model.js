const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
    Module này dùng để lưuu trữ thông tin trình độ nhân viên nào ứng với loại hàng nào
    Có nghĩa là: staff level ứng với những joblevel nào
    Mục đích: 
    1. Liên quan tới trình độ nhân viên ( staff level)
    2. Mỗi staff level chỉ làm được 1 số job level nhất định
    3. Khi staff load job ( nhận việc ) thì chỉ load được những job level ứng với trình độ ( staff level ) của mình
    4. Khi TLA giao việc trực tiếp cho nhân viên thì dựa vào job level sẽ load lên những nhân viên có trình độ tương ứng làm đc job level đó
*/

const staffLevelAndJobLevel = new Schema({
    staff_lv:{
        type: Schema.Types.ObjectId,
        ref: 'staff_level'
       
    },
    job_lv:{
        type: Schema.Types.ObjectId,
        ref: 'job_level'
    }    
});

staffLevelAndJobLevel.index({ staff_lv: 1, job_lv: 1 }, { unique: true });

module.exports = mongoose.model('staff_job_level',staffLevelAndJobLevel);



