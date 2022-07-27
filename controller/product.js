const Product = require("../model/product")
const { CustomError } = require('../helper/errorHandler')
const cloudinary = require('../cloudinary')
const dotenv = require('dotenv')
dotenv.config()

exports.add = async (req, res, next) => {
    try {
        let lengths = req.body.categories

        if (!req.files) {
            return res.status(400).json({
                message: "please upload image",
                status: 400
            })
        }
        const uploadCloudinary = await cloudinary.uploader.upload(req.files[0].path)
        let obj = {}
        obj.title = req.body.title
        obj.desc = req.body.desc

        let categories = []

        req.body.categories.map((length,index)=> {
            let objCategories = {}
            objCategories.name = length.name,
            objCategories.price = length.price,
            objCategories.size = length.size,
            objCategories.img = uploadCloudinary.secrure_url,
            objCategories.quantity = length.quantity

            categories.push(objCategories)
        })
        let result = {...obj,categories:categories}

        const ProductAdd = new Product(result)

        const add = await ProductAdd.save()
        res.status(201).json({
            message: "success to add Product",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.productOne = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        res.status(200).json({
            data: product,
            status: 200,
            message: "success find product"
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.list = async (req, res, next) => {
    try {
        let ObjectSearch = {}

        const title = new RegExp(["^", req.query.title].join(""), "i")
        const categories = new RegExp(["^", req.query.categories].join(""), "i")

        req.query.title ? ObjectSearch.title = title : null
        if (req.query.categories) {
            ObjectSearch = { ...ObjectSearch, "categories.name": categories }
        }

        const product = req.query ? await Product.find(ObjectSearch) : await Product.find()
        res.status(200).json({
            data: product,
            status: 200,
            message: "success find products"
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.update = async (req, res, next) => {
    try {
        const uploadCloudinary = await cloudinary.uploader.upload(req.files[0].path)
        let obj = {}
        obj.title = req.body.title
        obj.desc = req.body.desc

        let categories = []

        req.body.categories.map((length,index)=> {
            let objCategories = {}
            objCategories.name = length.name,
            objCategories.price = length.price,
            objCategories.size = length.size,
            objCategories.img = uploadCloudinary.secrure_url,
            objCategories.quantity = length.quantity

            categories.push(objCategories)
        })
        let result = {...obj,categories:categories}
      
        const update = await Product.findByIdAndUpdate(req.params.id, {
            $set: result
        })
        res.status(200).json({
            status: 200,
            message: 'Success update product'
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.delete = async (req, res, next) => {
    try {
        const deleteData = await Product.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status: 200,
            message: "success delete data"
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.addCategories = async (req, res, next) => {
    try {
        const uploadCloudinary = await cloudinary.uploader.upload(req.files[0].path)
        const addCategory = await Product.updateOne({ _id: req.params.id }, {
            $push: {
                categories: {
                    name: req.body.categories[0].name,
                    price: req.body.categories[0].price,
                    size: req.body.categories[0].size,
                    img:uploadCloudinary.secrure_url,
                    quantity: req.body.categories[0].quantity
                }
            }
        })
        res.status(201).json({
            message: "success to add Categories",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.updateCategories = async (req, res, next) => {
    try {
        const uploadCloudinary = await cloudinary.uploader.upload(req.files[0].path)
        const updateCategory = await Product.updateOne({
            categories: {
                $elemMatch: {
                    _id: req.body.categories[0]._id
                }
            }
        }, {
            $set: {
                "categories.$": {
                    name: req.body.categories[0].name,
                    price: req.body.categories[0].price,
                    size: req.body.categories[0].size,
                    img: uploadCloudinary.secrure_url,
                    quantity: req.body.categories[0].quantity
                }
            }
        }
        )
        res.status(201).json({
            message: "success to update Categories",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.incDecQuantity = async (req, res, next) => {
    try {
        const updateQuantity = await Product.updateOne({
            categories: {
                $elemMatch: {
                    _id: req.body.categories._id
                }
            }
        }, {
            $inc: {
                "categories.$.quantity": req.body.categories.quantity
            }
        }
        )
        res.status(201).json({
            message: "success to update quantity",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.getCategories = async (req, res, next) => {
    try {
        let ObjectSearch = {}
        const nameCategory = new RegExp(["^", req.query.name].join(""), "i")
        if (req.query) {
            ObjectSearch = { ...ObjectSearch, "categories.name": nameCategory }
        }
        console.log(ObjectSearch)
        const categories = Object.keys(ObjectSearch).length !== 0 ? await Product.aggregate([
            {
                $unwind: "$categories"
            },
            {
                $match: ObjectSearch
            },
            {
                $project: {
                    name: "$categories.name"
                }
            },
            {
                $group: {
                    _id: {
                        name: "$name"
                    }
                }
            }
        ]) : await Product.aggregate([
            {
                $unwind: "$categories"
            },
            {
                $project: {
                    name: "$categories.name"
                }
            },
            {
                $group: {
                    _id: {
                        name: "$name"
                    }
                }
            }
        ])
        res.status(200).json({
            data: categories,
            message: "success to get categories",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.changeDiscount = async (req, res, next) => {
    try {
        const updateDiscount = await Product.updateOne({
            categories: {
                $elemMatch: {
                    _id: req.body.categories._id
                }
            }
        }, {
            $set: {
                "categories.$.discount": req.body.categories.discount
            }
        }
        )
        res.status(201).json({
            message: "success to update discount",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}
