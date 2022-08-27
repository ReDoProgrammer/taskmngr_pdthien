const CheckIn = require('../BE/models/checkin-model');


async function ValidateCheckIn(req, res, next) {

    let userId = req.user._id;

    let check = await CheckIn.countDocuments({
        staff: userId,
        check_in: true
    });
    if (check == 0) {
        return res.status(403).json({
            msg: `You can not access this function while you are out of company!`
        })
    }
    next();
}

module.exports = {
    ValidateCheckIn
}