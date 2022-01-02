const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ProductSchema = new mongoose.Schema({
    userId:{
        type: Schema.Types.ObjectId,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    brand:{
        type:String
    },
    quantity:{
        type:Number,
        required:true
    },
    created:{
        type:Date,
        default:Date.now()
    },
    updated:{
        type:Date,
        default:Date.now()
    },
    rating:{
        type:Number,
    },
    features:{
        type:Array
    }
})

const Product = mongoose.model("Product",ProductSchema)
module.exports = Product