const Module = require('../BE/models/module-model');


getModule = (_MODULE) => {
    return new Promise(async (resolve, reject) => {
        let module = await Module.findOne({name:_MODULE});
        if(!module){
            return reject({
                code:404,
                msg:`Module not found!`
            })
        }
        return resolve(module);
    })
}

module.exports = {
    getModule
}