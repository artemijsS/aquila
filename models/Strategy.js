const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    urlId: {type: String, required: true},
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    source: {type: String, required: true},
    workedTimes: {type: Number, required: true, default: 0},
    avgProfitability: {type: Number, required: true, default: 0},
    profitability: {type: Number, required: true, default: 0},
    percentOfWins: {type: Number, required: true, default: 0}
})

module.exports = model('Strategy', schema)
