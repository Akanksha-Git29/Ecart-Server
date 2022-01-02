const express = require("express")
const router = express.Router()
const auth = require('../middleware/authorization')
const {isEmpty} = require('lodash')
const Product = require('../models/Products')
const Cart = require('../models/Cart')
const Payment = require('../models/Payment')
const stripe = require('stripe')(
    "sk_test_51Jd81CSIcc5Zgixhr3HbryvJSzUhNpkIzZowiX7B2m1A92QrVGfWfSDuwucUFq5vPY9EOEh9LyiH5JWh8eIlMTxJ00AVUq5A8i"
)

router.post("/",auth,async(req,res)=>{
    try {
        // console.log(cart)
        // console.log(total,token)
        const {cart,total,token} = req.body
        const {card} = token
        const shippingAddress = {
            address1: card.address_line1,
            address2: card.address_line2,
            city: card.address_city,
            counntry: card.address_country,
            state: card.address_state,
            zip: card.address_zip,
        };
        stripe.charges.create({
            amount: total*75,
            currency:"INR",
            receipt_email: token.email,
            source: req.body.token.id,
            description:`Payment for the purchase of ${cart.products.lengt} items from ECart` 
        },
        async (err,charge) =>{
            if(err) 
                return res.send({status:400,err})
            console.log(charge)
            if(charge && charge.status === 'succeeded'){
                const authorization = {
                    ...charge.payment_method_details,
                    reciept: charge.reciept_url,
                    token: token.id,
                };
                const context = {
                    authorization,
                    userId: req.user.id,
                    cartId: cart._id,
                    reference: charge.id,
                    transaction: charge.balance_transaction,
                    shippingAddress,
                };
                let payment = new Payment(context)
                payment = await payment.save()

                await Cart.findOneAndUpdate(
                    {_id: cart._id},
                    {$set:{fulfilled:true}},
                    {new: true}
                )
                const theCart = await Cart.findById({_id: cart._id})
                theCart.products.forEach(async (product) =>{
                    let productDetails = await Product.findById({_id: product})
                    const qnty = Number(productDetails.quantity)-1
                    await Product.findOneAndUpdate(
                        {_id: product},
                        {$set: {quantity: qnty}},
                        {new : true}
                    )
                })
                res.send({status:200})
            }
        })
    } catch (error) {
        res.sendStatus(500)
    }
})

module.exports = router