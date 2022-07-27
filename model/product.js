const moongose = require('mongoose')

const productSchema = new moongose.Schema({
    title: { type: String, required: true},
    desc: { type: String, required: true},
    categories: [
        {
            name:{
                type:String,
                required:true
            },
            price:{
                type:Number,
                default:1
            },
            size: {
                type:String,
                required:true             
            },
            discount:{
                type: Number,
                default:0
            },
            img: {
                 type: String,
                 required: true 
            },
            quantity: {
                type: Number,
                required:true
            }
        }
    ]
}, { timestamps: true })

module.exports = moongose.model( "product", productSchema)