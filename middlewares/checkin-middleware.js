const CheckIn = require('../BE/models/staff-checkin');


function ValidateCheckIn(req, res, next) {

    let userId = req.user._id;

    CheckIn.find({ staff: userId })
        .then(cki => {
            if (cki.length == 0) {
                return res.status(403).json({
                    msg: `You can not execute this mission when you are out of office!`
                })
            }
            if (cki[cki.length - 1].out) {
                return res.status(403).json({
                    msg: `You can not execute this mission when you are out of office!`
                })
            }
            next();
        })
        .catch(err => {
            return res.status(500).json({
                msg:`Error validate checkin: ${new Error(err.message)}`
            })
        })
}

module.exports = {
    ValidateCheckIn
}