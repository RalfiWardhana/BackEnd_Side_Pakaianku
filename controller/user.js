const User = require("../model/user")
const CryptoJS = require("crypto-js")
const dotenv = require('dotenv')

dotenv.config()

exports.list = async (req, res, next) => {
    try {
        let objectSearch = {}

        const email = new RegExp(["^", req.query.email].join(""), "i")
        const username = new RegExp(["^", req.query.username].join(""), "i")
        
        req.query.email ? objectSearch.email = email : null
        req.query.username ? objectSearch.username = username : null

        const listUser = req.query ? await User.find(
            objectSearch,{ password: 0, isAdmin:0}
         )
         : await User.find({},{password: 0, isAdmin:0})
 

        res.status(200).json({
            data: listUser,
            status: 200,
            message: "Success find user"
        })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.userOne = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        const  {password,...others} = user._doc
        res.status(200).json({
            data: others,
            status: 200,
            message: 'Success find user'
        })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

exports.update = async (req, res, next) => {
    try {
        if (req.body.password) {
            const hashPassword = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
            req.body.password = hashPassword
        }

        const update = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        })
        res.status(200).json({
            status: 200,
            message: 'Success updare user'
        })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}
exports.delete = async (req, res, next) => {
    try {
        const deleteData = await User.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status: 200,
            message: "success delete data"
        })
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}