const CheckIn = require('../BE/models/staff-checkin');


CheckIn = (userId) => {
    return new Promise(async (resolve, reject) => {
        let checkIn = CheckIn.find({staff});
        return resolve(module);
    })
}

module.exports = {
    CheckIn
}