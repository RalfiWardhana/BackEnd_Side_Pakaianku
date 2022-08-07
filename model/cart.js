const moongose = require('mongoose')

const cartSchema = new moongose.Schema({
    userId: { type: moongose.Schema.Types.ObjectId, ref: 'users' },
    active: {type:Boolean},
    products:[
        {
            categoryId:{ type: moongose.Schema.Types.ObjectId, ref: 'products' },
            quantity:{
                type:Number,
                default:1
            }
        }
    ]
}, { timestamps: true })

module.exports = moongose.model(  "cart", cartSchema)