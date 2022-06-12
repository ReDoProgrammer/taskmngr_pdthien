const router = require('express').Router();
const FileFormat = require('../../models/file-format-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, async (req, res) => {
    let id = req.body.id;
    let ff = await FileFormat.findById(id);
    if (!ff) {
        return res.status(404).json({
            msg: `File format not found!`
        });
    }

    await ff.delete()
        .then(_ => {
            return res.status(200).json({
                msg: `The file format has been deleted!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this file format with error: ${new Error(err.message)}`
            })
        })
})

router.get('/', async (req, res) => {
    let ffs = await FileFormat.find({});
    return res.status(200).json({
        msg: 'Load file format list successfully!',
        ffs: ffs
    });
});

router.get('/type', async (req, res) => {
    let { is_input } = req.query;

    let ffs = await FileFormat.find({ is_input })
    return res.status(200).json({
        msg: `Load file format list based on type successfully!`,
        ffs
    })
})

router.get('/detail', authenticateAdminToken, async (req, res) => {
    let { id } = req.query;
    let ff = await FileFormat.findById(id);
    if (!ff) {
        return res.status(404).json({
            msg: `File format not found!`
        })
    }
    return res.status(200).json({
        msg: `Load file format detail successfully!`,
        ff
    })
})


router.post('/', authenticateAdminToken, async (req, res) => {
    let { name, description, is_input } = req.body;


    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'File format name can not be blank'
        });
    }

    let ff = new FileFormat({
        name: name,
        description,
        is_input
    });
    await ff.save()
        .then(ff => {
            return res.status(201).json({
                msg: 'File format has been created!',
                ff: ff
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not add new file format with error: ${new Error(err.message)}`,
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, async (req, res) => {
    let { id, name, description, is_input } = req.body;


    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: `File format name can not be blank!`
        });
    }

    let ff = await FileFormat.findById(id);
    if (!ff) {
        return res.status(404).json({
            msg: `File format not found!`
        })
    }
    ff.name = name;
    ff.description = description;
    ff.is_input = is_input;

    await ff.save()
        .then(_ => {
            return res.status(200).json({
                msg: `File format has been updated!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not update file format with error: ${new Error(err.message)}`
            })
        })



})

module.exports = router;