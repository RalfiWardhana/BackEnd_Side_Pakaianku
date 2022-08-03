const moongose = require('mongoose')
const Faq = require("../model/faq")
const { CustomError } = require('../helper/errorHandler')

exports.add = async (req, res) => {
    try {
        const faq = new Faq(req.body)
        const add = await faq.save()
        res.status(201).json({
            message: "success to add FAQ",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.list = async (req, res) => {
    try {
        const lists = await Faq.find()
        res.status(201).json({
            lists,
            message: "success to get lists FAQ",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.one = async (req, res) => {
    try {
        const lists = await Faq.findOne({_id:req.params.id})
        res.status(201).json({
            lists,
            message: "success to get FAQ",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.updateOne = async (req, res) => {
    try {
        const update = await Cart.findByIdAndUpdate(req.params.id, {
            $set: req.body
        })
        res.status(201).json({
            message: "success to update FAQ",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.delete = async (req, res) => {
    try {
        const deleteData = await Order.findByIdAndDelete(req.params.id)
        res.status(201).json({
            message: "success to delete FAQ",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}