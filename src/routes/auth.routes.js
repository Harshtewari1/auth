const express = require('express')
const userModel = require("../models/user.model")
const jwt = require('jsonwebtoken')


const router = express.Router()


router.post('/register',async (req, res) => {
    const { username, password } = req.body
    
    const user = await userModel.create({
        username,password
    })

    const token = jwt.sign({
        id:user._id,
    }, process.env.JWT_SECRET)
    
    res.cookie("token", token)

    res.status(201).jsonp({
        message: "user Registered Successfully",
        user,
    })
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    const user = await userModel.findOne({
        username:username
    })
    if (!user) {
        return res.status(401).json({
            message:"user account not found"
        })
    }

    const isPasswordValid = password == user.password

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid password"
        })
    }

    res.status(200).json({
        message:"successfully logged in"
    })
})

router.get('/user', async (req, res) => {
    const { token } = req.cookies
    
    if (!token) {
        return res.status(401).json({
            message:"unauthorised"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findOne({
            _id:decoded.id
        }).select("-password -__v")
        res.status(200).json({
            message: "user data fetched Successfully",
            user
        })



    } catch (error) {
        return res.status(401).json({
            message:"Unauthorised-Invalid Token"
        })
    }
    

})

router.get('/logout', (req, res) => {
    res.clearCookie("token")
    res.status(200).json({
        message:"logout successfully"
    })
})



module.exports = router