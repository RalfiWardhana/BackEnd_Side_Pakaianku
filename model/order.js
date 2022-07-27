const moongose = require('mongoose')

const cartSchema = new moongose.Schema({
    userId: { type: String, required: true},
    products:[
        {
            categoryId:{
                type:String,
                default:false
            },
            quantity:{
                type:Number,
                default:1
            }
        }
    ],
    buktiPayment :{type:String,required: true },
    amount: {type: Number, required: true},
    address: {type:Object, required:true},
    status: {type:Number, default:0}
}, { timestamps: true })

module.exports = moongose.model(  "order", cartSchema)