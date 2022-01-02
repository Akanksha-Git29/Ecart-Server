const express = require('express')
const router = express.Router()
const {check,validationResult} = require('express-validator')
const User = require('../models/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/keys')

router.get("/",(req,res)=>{
    res.send("Users route")
})

router.post("/",
[
    check("name","Name is required").not().isEmpty(),
    check("email","Email is required").isEmail(),
    check("password","Please password should be of 5 characters").isLength({min:5})
],
async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty())
        return res.status(400).json({errors: errors.array()})
    try {
        const {name,email,password,role} = req.body
        let user = await User.findOne({email: email})
        if(user){
            return res
            .status(400)
            .json({errors:[{msg:"user alreadu exsist"}]})
        }
        user = new User({
            name, 
            email,
            password,
            role
        })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password,salt)
        user.save()
        const payload = {
            user:{
                id:user.id,
            }
        }
        jwt.sign(payload,
            config.jwtSecret,
            {expiresIn:3600*24},
            (err,token)=>{
                if(err) throw err
                res.json({token})
            }
        )
        // res.send("Users Created")
    } catch (error) {
        console.log(error)
        res.status(500).send("Server error")
    }
    
})

module.exports = router