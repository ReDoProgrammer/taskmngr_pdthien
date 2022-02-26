const router = require('express').Router();
const Queue = require('../../models/queue-model');
const Task = require('../../models/task-model');
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const {getStaffJobLevel} = require('../common');

router.post('/',authenticateTLAToken,(req,res)=>{
    let {levelId} = req.body;
    console.log(levelId);
})

module.exports = router;

const getEarliestRegistedEditor = (jobLevelId)=>{
    return new Promise((resolve,reject)=>{
        Queue
        .findOne({
            // staff:{$in:}
        })
        .sort({timestamp:i})
        .limit(1)
        .exec()
        .then(q=>{
            if(!q){
                return reject({
                    code:404,
                    msg:`Earliest registed editor can not found!`
                })
            }
            return resolve(q);
        })
        .catch(err=>{
            return reject({
                code:500,
                msg:`Can not get earliest registed editor with error: ${new Error(err.message)}`
            })
        })
    })
}