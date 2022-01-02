const mongoose = require("mongoose")
const Schema = mongoose.Schema

const cartSchema = new Schema({
    products:{
        type:[Schema.Types.ObjectId],
        required:true
    },
    userId:Schema.Types.ObjectId,
    fulfilled:{
        type:Boolean,
        default: false
    }
},
{timestamps: true}
)

const Cart = mongoose.model("Cart",cartSchema)
module.exports = Cart