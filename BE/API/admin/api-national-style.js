const router = require('express').Router();
const NationalStyle = require('../../models/national-style-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const nationalStyleModel = require('../../models/national-style-model');

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    NationalStyle.findOneAndDelete({ _id: id }, (err, ns) => {
        if (err) {
            return res.status(500).json({
                msg: `Can not delete national style with error: ${new Error(err.message)}`,
                error: new Error(err.message)
            });
        }

        if (ns) {
            return res.status(200).json({
                msg: `National style has been deleted successfully!`
            });
        } else {
            return res.status(404).json({
                msg: `National style not found`
            });
        }

    })
})

router.get('/',authenticateAdminToken, (req, res) => {
    NationalStyle.find({}, (err, nss) => {
        if (err) {
            return res.status(500).json({
                msg: `Load national styles list failed with error: ${new Error(err.message)}`
            });
        }
        
        return res.status(200).json({
            msg: 'Load national styles list successfully!',
            nss: nss
        });
    });
});

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    NationalStyle.findById(id, (err, ns) => {
        if (err) {
            return res.status(500).json({
                msg: `Can not get national style detail with error: ${new Error(err.message)}`,
                error: new Error(err.message)
            });
        }
        if (ns) {
            return res.status(200).json({
                msg: `Load national style detail successfully`,
                ns: ns
            })
        } else {
            return res.status(404).json({
                msg: `National style not found`
            });
        }
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description } = req.body;
   
    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'National style name can not be blank'
        });
    }

    let ns = new NationalStyle({
        name: name,
        description: description       
    });
    ns.save()
        .then(ns => {
            return res.status(201).json({
                msg: 'National style has been added successfully!',
                ns: ns
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not add national style with error: ${new Error(err.message)}`,
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'National style name can not be blank!'
        });
    }



    NationalStyle.findOneAndUpdate({ _id: id }, {
        name,
        description      
    }, { new: true }, (err, ns) => {
        if (err) {
            return res.status(500).json({
                msg: `Update national style failed with error: ${new Error(err.message)}`,
                error: new Error(err.message)
            });
        }

        if (ns) {
            return res.status(200).json({
                msg: 'Update national style successfully!',
                ns: ns
            });
        } else {
            return res.status(500).json({
                msg: `Update national style failed with error: ${new Error(err.message)}`
            });
        }
    })
})

module.exports = router;