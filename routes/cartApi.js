const express = require("express")
const router = express.Router()
const auth = require('../middleware/authorization')
const {isEmpty} = require('lodash')
const Product = require('../models/Products')
const Cart = require('../models/Cart')

router.get("/",auth, async (req,res)=>{
    try {
        const userId = req.user.id
        const carts = await Cart.find({userId})
        if(isEmpty(carts)){
            return res.send({products:[]})
        }
        let retriveCart
        carts.forEach((cart) =>{
            if(!cart.fulfilled)
                retriveCart = cart
        })
        let products = []
        let result
        if(!isEmpty(retriveCart)){
            products = retriveCart.products.map( async (product) => await Product.findById({_id: product})
            )
            products = await Promise.all(products)
            result = {...retriveCart.toJSON(), products}
        }
        res.send({result})
        console.log(req.body)
    } catch (error) {
        res.send(500)
    }
})

router.put("/:id",auth, async (req,res)=>{
    try {
        const cartId = req.params.id
        const product = req.body.product
        const cart = await Cart.update(
            {_id: cartId},
            {$pullAll:{products:[product]}},
            {multi: true}
        )
        res.send({cart})
    } catch (error) {
        res.send(500)
    }
})

router.post("/", auth, async (req,res)=>{
    try {
        const userId = req.user.id
        const {products} = req.body
        let cart, unfulfiledCart
        const carts = await Cart.find({userId})
        const hasValidCart = carts.reduce((acc,value)=>{
            if(!value.fulfilled){
                unfulfiledCart = value
            }
            return acc && value.fulfilled
        }, true)
        if(hasValidCart){
            cart = new Cart ({userId,products})
            cart = await cart.save()
        }
        else{
            const stringProduct = [
                ...unfulfiledCart.products,
                ...products
            ].map(product =>product.toString())
            const newProduct = Array.from(new Set(stringProduct))
            cart = await Cart.findByIdAndUpdate(
                {_id : unfulfiledCart._id},
                {products: newProduct}
            )
        }
        let value = cart.products.map(async(id)=> await Product.findById(id)) //retriving product information by ID
        value = await Promise.all(value)
        res.send({...cart.toJSON(), products: value})
    } catch (err) {
        res.send(err)
    }
})

module.exports = router