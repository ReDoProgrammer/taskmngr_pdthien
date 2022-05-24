const router = require('express').Router();
const ParentsLevel = require('../../models/parent-level-model');
const JobLevel = require('../../models/job-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    ParentsLevel.findOneAndDelete({ _id: id }, (err, size) => {
        if (err) {
            return res.status(500).json({
                msg: `Can not delete parents level with error: ${new Error(err.message)}`,
                error: new Error(err.message)
            });
        }

        if (size) {
            return res.status(200).json({
                msg: `Parents level has been deleted!`
            });
        } else {
            return res.status(404).json({
                msg: `Parents level not found`
            });
        }

    })
})


router.get('/list', (req, res) => {
    ParentsLevel.find({}, (err, pls) => {
        if (err) {
            return res.status(500).json({
                msg: `Can not load parents levels list with error: ${new Error(err.message)}`
            });
        }

        return res.status(200).json({
            msg: `Load parents levels list successfully!`,
            pls
        });
    });
});



router.post('/', authenticateAdminToken,async (req, res) => {
    let { name } = req.body;
    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: `Parents level could not be blank!`
        });
    }

    let pl = new ParentsLevel({
        name
    });
    await pl.save()
    .then(_=>{
        return res.status(201).json({
            msg:`Insert new parents level successfully!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not insert parents level with error: ${new Error(err.message)}`
        })
    })
    
})

router.put('/', authenticateAdminToken, async (req, res) => {
    let { id, name } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg:`Parents level name could not be blank!`
        });
    }

    let pl = await ParentsLevel.findById(id);
    if(!pl){
        return res.status(404).json({
            msg:`Parents level not found!`
        })
    };

    pl.name = name;
    await pl.save()
    .then(_=>{
        return res.status(200).json({
            msg:`The parents level has been updated!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not update parents level with error: ${new Error(err.message)}`
        })
    })
    
})

router.put('/pull-child',authenticateAdminToken,async (req,res)=>{
    let {levelId,plId} = req.body;

    let pl =await ParentsLevel.findById(plId);
    if(!pl){
        return res.status(404).json({
            msg:`Parents level not found!`
        })
    }

    pl.levels.pull(levelId);
    await pl.save()
    .then(async _=>{
        let jl =await JobLevel.findById(levelId);
        jl.parents = null;
        await jl.save()
        .then(_=>{
            return res.status(200).json({
                msg:`Job level has been delete from this parents level`
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not delete job level from this parents level with error: ${new Error(err.message)}`
            })
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not update Parents level with erro: ${new Error(err.message)}`
        })
    })


})

router.put('/push-child',authenticateAdminToken,async (req,res)=>{
    let {levelId,plId} = req.body;
    let pl =await ParentsLevel.findById(plId);
    if(!pl){
        return res.status(404).json({
            msg:`Parents level not found!`
        })
    }
  

    let chk = pl.levels.filter(x=>x ==levelId);
    if(chk.length >0){
        return res.status(403).json({
            msg:`This job level is already exist in this parents level`
        })
    }
   
    pl.levels.push(levelId);
    await pl.save()
    .then(async _=>{
      let jl = await JobLevel.findById(levelId);
      jl.parents = pl._id;
      await jl.save()
      .then(_=>{
          return res.status(200).json({
              msg:`Push job level into parents level successfully!`
          })
      })
      .catch(err=>{
          return res.status(500).json({
              msg:`Can not push job level into parents level with error: ${new Error(err.message)}`
          })
      })

    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not push job level into parents level with error: ${new Error(err.message)}`
        })
    })
    
})

module.exports = router;