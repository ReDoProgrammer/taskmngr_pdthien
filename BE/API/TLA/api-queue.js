const router = require('express').Router();
const Queue = require('../../models/queue-model');
const Task = require('../../models/task-model');
const StaffJobLevel = require('../../models/staff-job-level-model');
const User = require('../../models/user-model');
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const {assignOrTakeTask} = require('../common');
const _MODULE = 'EDITOR';

router.post('/', authenticateTLAToken, (req, res) => {

    let { taskId } = req.body;   
    setRegistedEditor(taskId)
    .then(_=>{
        return res.status(200).json({
            msg:`Editor has been set successfully!`
        })
    })
    .catch(err=>{
        console.log(err.msg);
        return res.status(err.code).json({
            msg:err.msg
        })
    })
    


})

module.exports = router;



//hàm set editor tự động theo hàng đợi đã đăng ký trước
const setRegistedEditor = (taskId)=>{
    return new Promise((resolve,reject)=>{
        Task//lấy thông tin của task truyền vào
        .findById(taskId)
        .exec()
        .then(t=>{
            if(!t){
                return reject({
                    code:404,
                    msg:`Task not found!`
                })
            }

            //lấy trình độ của nhân viên phù hợp với yêu cầu về level của task
            getStaffLevelFromJobLevel(t.level)
            .then(sls=>{
                //lấy ra 1 phần tử đã đăng ký sớm nhất từ hàng đợi
                getQueue(sls)
                .then(q=>{   
                    console.log('queue: ',q);            
                    assignOrTakeTask(_MODULE,t._id,t.level,q.staff,true)
                    .then(async t=>{
                        console.log('task: ',t);
                        //sau khi gán tự động xong thì phải loại bỏ phần tử hàng chờ đã được lấy ở trên ra khỏi hàng chờ
                        await RemoveStaffFromQueue(q.staff)
                        .then(_=>{
                            return resolve();
                        })
                        .catch(err=>{
                            console.log(err);
                            return reject(err)
                        })
                    })
                    .catch(err=>{
                        return reject(err);
                    })
                })
            })
            .catch(err=>{
                return res.status(err.code).json({
                    msg:err.msg
                })
            })         

        })
        .catch(err=>{
            console.log(`Can not get task by id with error: ${new Error(err.message)}`);
            return reject({
                code:500,
                msg:`Can not get task by id with error: ${new Error(err.message)}`
            })
        })
    })
}

const RemoveStaffFromQueue = (staffId)=>{
    return new Promise((resolve,reject)=>{
        Queue
        .findOneAndDelete({staff:staffId},err=>{
            if(err){
                return reject({
                    code:500,
                    msg:`Can not remove staff from queue with error: ${new Error(err.message)}`
                })
            }
            return resolve();
        })
    })
}

const getQueue = (staffLevelIds)=>{
    return new Promise((resolve,reject)=>{
        User
        .find({user_level:{$in:staffLevelIds}})
        .exec()
        .then(users=>{
            if(users.length == 0){
                return reject({
                    code:404,
                    msg:`Can not find any user based on these staff level`
                })
            }
            let uid = users.map(x=>{
                return x._id;
            })

            Queue
            .findOne({
                staff:{$in:uid}
            })
            .sort({timestamp: 1})
            .exec()
            .then(q=>{
               
                if(!q){                   
                    return reject({
                        code:404,
                        msg:`There is no editor that registed to take a new task`
                    })
                }

                console.log('qqqqqqqqqqqqqqqq: ',q);
                return resolve(q);
            })
            .catch(err=>{
                console.log(`Can not get any queue with error: ${new Error(err.message)}`);
                return reject({
                    code:500,
                    msg:`Can not get any queue with error: ${new Error(err.message)}`
                })
            })
          
        })
        .catch(err=>{
            return reject({
                code:500,
                msg:`Can not get users from staff level ids with error: ${new Error(err.message)}`
            })
        })
    })
}

//ham tra ve staff level tu job level
const getStaffLevelFromJobLevel = (jobLvId)=>{
    return new Promise((resolve,reject)=>{
        StaffJobLevel
        .find({job_lv:jobLvId})
        .exec()
        .then(sjls=>{
            if(sjls.length==0){
                return reject({
                    code:404,
                    msg:`Staff levels not found!`
                })
            }
            let sls = sjls.map(x=>{
                return x.staff_lv
            })
            return resolve(sls)
        })
        .catch(err=>{
            return reject({
                code:500,
                msg:`Can not get staff levels from job level id with error: ${new Error(err.message)}`
            })
        })
    })
}




