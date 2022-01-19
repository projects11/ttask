const {Schema, model} = require('mongoose')

const files = new Schema({
    fieldname: String ,
    originalname: String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    path: String,
    size: Number,
    stamp: Number,
    delete: Boolean

})

module.exports = model('Files', files)

