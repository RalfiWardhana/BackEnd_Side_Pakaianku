const moongose = require('mongoose')

const cartSchema = new moongose.Schema({
    userId: { type: String, required: true},
    active: {type:Boolean},
    products:[
        {
            categoryId:{
                type:String
            },
            quantity:{
                type:Number,
                default:1
            }
        }
    ]
}, { timestamps: true })

module.exports = moongose.model(  "cart", cartSchema)