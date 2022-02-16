const Module = require('../BE/models/module-model');


getModuleId = (_MODULE) => {

    return new Promise((resolve, reject) => {
        Module
            .findOne({ name: _MODULE })
            .exec()
            .then(mod => {
                
                if (!mod) {
                    return reject({
                        code: 404,
                        msg: `Module not found`
                    })
                }
                return resolve({
                    code: 200,
                    msg: `Module found`,
                    mod
                })
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get module with error: ${new Error(err.message)}`
                })
            })
    })
}

module.exports = {
    getModuleId
}