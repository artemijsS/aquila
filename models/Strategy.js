const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    urlId: {type: String, required: true},
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    percentage: {type: String, required: true},
    source: {type: String, required: true},
    rating: {type: Number, required: false}
})

module.exports = model('Strategy', schema)
