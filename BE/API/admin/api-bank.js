const router = require('express').Router();
const Bank = require('../../models/bank-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    Bank.findOneAndDelete({ _id: id }, (err, bank) => {
        if (err) {
            return res.status(500).json({
                msg: 'Delete bank failed!',
                error: new Error(err.message)
            });
        }

        if (bank) {
            return res.status(200).json({
                msg: 'Delete bank successfully!'
            });
        } else {
            return res.status(404).json({
                msg: 'Bank can not found!'
            });
        }

    })
})

router.get('/list', (req, res) => {
    Bank.find({}, (err, banks) => {
        if (err) {
            return res.status(500).json({
                msg: 'Can not load banks list!',
                error: new Error(err.message)
            });
        }

        return res.status(200).json({
            msg: 'Lấy danh sách cloud thành công!',
            banks: banks
        });
    });
});

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    Bank.findById(id, (err, bank) => {
        if (err) {
            return res.status(500).json({
                msg: 'Can not get bank info!',
                error: new Error(err.message)
            });
        }
        if (bank) {           
            return res.status(200).json({
                msg: 'Get bank info successfully!',
                bank: bank
            })
        } else {
            return res.status(404).json({
                msg: 'Bank not found!'
            });
        }
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description } = req.body;   

    let bank = new Bank({
        name: name,
        description
    });
    bank.save()
        .then(bank => {
            return res.status(201).json({
                msg: 'Created bank successfully!',
                bank: bank
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Can not create a new bank!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description } = req.body;

    Bank.findOneAndUpdate({ _id: id }, {
        name,
        description
    }, { new: true }, (err, bank) => {
        if (err) {
            return res.status(500).json({
                msg: 'Update bank info failed!',
                error: new Error(err.message)
            });
        }

        if (bank) {
            return res.status(200).json({
                msg: 'Update bank successfully!',
                bank: bank
            });
        } else {
            return res.status(500).json({
                msg: 'Can not update bank info!'
            });
        }
    })
})

module.exports = router;