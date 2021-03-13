const router = require('express').Router();
const UserType = require('../../models/user-type-model');
const Wage = require('../../models/wage-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    UserType.findOneAndDelete({ _id: id }, (err, ut) => {
        if (err) {
            return res.status(500).json({
                msg: 'Delete user type failed!',
                error: new Error(err.message)
            });
        }

        if (ut) {
            return res.status(200).json({
                msg: 'User type was deleted successfully!'
            });
        } else {
            return res.status(404).json({
                msg: 'User type can not found!'
            });
        }

    })
})

router.get('/list', (req, res) => {
    UserType.find({}, (err, uts) => {
        if (err) {
            return res.status(500).json({
                msg: 'load user group types failed'
            });
        }

        return res.status(200).json({
            msg: 'Load user types successfully!',
            uts: uts
        });
    });
});

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    UserType.findById(id)
    .populate({
        path:'wages',
        populate:{path:'skill'}       
    })
    .populate({
        path:'wages',
        populate:{path:'level'}       
    })
    .exec((err,ut)=>{
        if(err){
            return res.status(500).json({
                msg:'can not get user type detail',
                error:new Error(err.message)
            })
        }
        if(ut){
            return res.status(200).json({
                msg:'get user type detail successfully',
                ut:ut
            })
        }
        else{
            return res.status(403).json({
                msg:'User type not found!'
            })
        }
    })
   
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description,wages } = req.body;


    //validation user type name
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Please input user type name'
        });
    }

    
   //wages validation
   if (typeof wages == 'undefined' || wages.length == 0) {
    return res.status(403).json({
      msg: "wage list can not be empty!",
    });
  }

    let ut = new UserType({
        name: name,
        description: description        
    });
    ut.save()
        .then(ut => {
            InsertWages(ut._id,wages)
            .then(ut =>{
                return res.status(201).json({
                    msg:'Create new User type successfully',
                    ut:ut
                })
            })
            .catch(err=>{
                return res.status(500).json({
                    msg:err.msg,
                    error:new Error(err.message)
                })
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Can not create user type!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description,wages } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Please input user type name'
        });
    }



    UserType.findOneAndUpdate({ _id: id }, {
        name,
        description      
    }, { new: true }, (err, ut) => {
        if (err) {
            return res.status(500).json({
                msg: 'Can not update user type!',
                error: new Error(err.message)
            });
        }

        if (ut) {
            UpdateWages(id,wages)
            .then(ut=>{
                return res.status(200).json({
                    msg:'Update user type successfully!',
                    ut:ut
                })
            })
            .catch(err=>{
                return res.status(500).json({
                    msg:'Can not update user type!',
                    error:new Error(err.message)
                })
            })
        } else {
            return res.status(500).json({
                msg: 'Can not found user type!'
            });
        }
    })
})



var UpdateWages = (userTypeId,wages)=>{
    return new Promise((resolve,reject)=>{
        Wage.find({user_type:userTypeId},(err,wl)=>{
            if(err){
                return reject({
                    msg:'User wages can not found!',
                    error:new Error(err.message)
                });
            }
            // let DiffInDB = wl.filter(x=>)           
           
        })
    })
}

var DeleteFromDB = (lst)=>{
    return new Promise((resolve,reject)=>{
        Wage.deleteMany({_id:{$in:lst}},err=>{
            if(err){
                return reject({
                    msg:'Can not delete wages from DB',
                    error:new Error(err.message)
                });
            }
            return resolve('Delete wages from db successfully!')
        })
    })
}



var InsertWages = (userTypeId,wages)=>{
    return new Promise(async (resolve,reject)=>{
        var wages_list =await wages.map(w=>{
            var obj  = {};
            obj['user_type'] = userTypeId;
            obj['skill'] = w.skill;
            obj['level'] = w.level;
            obj['wage'] = w.wage;
            return obj;
        });
        Wage.insertMany(wages_list,(err,wages)=>{
            if(err){
                return reject({
                    msg:'Can not insert wages list!',
                    error: new Error(err.message)
                })
            }
            if(wages){
                let wagesId = wages.map(w=>{
                    return w._id;
                })
               UserType.findOneAndUpdate({_id:userTypeId},{
                $push: { wages: wagesId } 
               },{new:true},(err,ut)=>{
                   if(err){
                       return reject({
                           msg:'Cannot push user type wages!',
                           error:new Error(err.message)
                       })
                   }
                   if(ut){
                       return resolve({
                           msg:'Init user type wage successfully!',
                           ut:ut
                       })
                   }
                   else{
                       return reject({
                           msg:'User type wage can not init!'
                       })
                   }
               })
            }
        })

    })
}

module.exports = router;


