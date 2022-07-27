const User = require("../model/user")
const CryptoJS = require("crypto-js")
const JWT = require('jsonwebtoken')
const dotenv = require('dotenv')
const nodemailer = require('nodemailer')
const { CustomError } = require('../helper/errorHandler')

dotenv.config()

exports.add = async (req, res) => {
    try {
        if (req.body.password) {
            const hashPassword = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
            req.body.password = hashPassword
        }

        const userAdd = new User(req.body)

        const add = await userAdd.save()
        res.status(201).json({
            message: "success to add user",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.login = async (req, res) => {
    try {
        const dataUser = await User.findOne({ email: req.body.email })
        !dataUser && res.status(401).json("Wrong creddentials")

        let originalPassword = CryptoJS.AES.decrypt(dataUser.password, process.env.PASS_SEC).toString(CryptoJS.enc.Utf8)
        originalPassword !== req.body.password && res.status(401).json("Wrong creddentials")

        const token = JWT.sign({
            id: dataUser._id,
            isAdmin: dataUser.isAdmin
        },
            process.env.JWT_SEC,
            { expiresIn: "1d" })

        const { password, ...other } = dataUser._doc

        res.status(200).json({ ...other, token })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.forgotPassword = async (req, res, next) => {
    try {
        const findEmail = await User.findOne({ email: req.body.email })
        if (!findEmail) {
            return res.status(400).json({
                status: 400,
                message: "Not found email"
            })
        }
        const token = JWT.sign({
            id: findEmail._id
        },
            process.env.JWT_SEC,
            { expiresIn: "1d" })

        const templeteEmail = {
            from:'Ralfi',
            to:req.body.email,
            subject:"Link password reset",
            html:`<p>Silahkan klik link untuk reset password</p><p>${process.env.CLIENT_URL}/reset-password/${token}</p>`
        }
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
              user: 'ralfigeophysics@gmail.com',
              pass: 'xzkqcsmnlzsyyhdp', 
            },
          })

        const sendMail = await transporter.sendMail(templeteEmail)  
        return res.status(200).json({
            status: 200,
            message:'Success to send email'
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}