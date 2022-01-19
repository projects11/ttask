const {Schema, model} = require('mongoose')

const actionLog = new Schema({

    stamp: Number,
    operation: String,
    cluster: String

})

module.exports = model('ActionLog', actionLog)


