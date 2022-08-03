const moongose = require('mongoose')

const userSchema = new moongose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true}
}, { timestamps: true })

module.exports = moongose.model("faq",userSchema)