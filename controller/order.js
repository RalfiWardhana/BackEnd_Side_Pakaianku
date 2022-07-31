const moongose = require('mongoose')
const Order = require("../model/order")
const User = require("../model/user")
const cloudinary = require('../cloudinary')
const dotenv = require('dotenv')
const { CustomError } = require('../helper/errorHandler')
dotenv.config()

exports.add = async (req, res, next) => {
    try {

        const uploadCloudinary = await cloudinary.uploader.upload(req.files[0].path)

        let obj = {}
        obj.userId = req.body.userId

        let products = []

        req.body.products.map((length, index) => {
            let objCategories = {}
            objCategories.categoryId = length.categoryId,
                objCategories.quantity = length.quantity
            products.push(objCategories)
        })

        let result = { ...obj, products: products }
        result.buktiPayment = uploadCloudinary.secure_url
        result.amount = req.body.amount
        result.address = req.body.address

        const OrderAdd = new Order(result)
        const add = await OrderAdd.save()

        const updateFalse = await Cart.updateOne({ userId: req.body.userId, active: true },{
            $set:{
                active:false
            }
        })

        res.status(201).json({
            message: "Success to add Order",
            status: 201
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.list = async (req, res, next) => {
    try {
        let ObjectSearch = {}
        const username = new RegExp(["^", req.query.username].join(""), "i")
        const email = new RegExp(["^", req.query.email].join(""), "i")
        const nameCategory = new RegExp(["^", req.query.nameCategory].join(""), "i")
        if (req.query.username) {
            ObjectSearch = { ...ObjectSearch, "_id.username": username }
        }
        if (req.query.email) {
            ObjectSearch = { ...ObjectSearch, "_id.email": email }
        }
        if (req.query.nameCategory) {
            ObjectSearch = { ...ObjectSearch, "item.categories.name": nameCategory }
        }
        const listOrder = Object.keys(ObjectSearch).length !== 0 ? await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: { "userObjId": { "$toObjectId": "$userId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userObjId"] } } },
                        { $project: { "username": 1, "email": 1 } }
                    ],
                    as: "dataUser",
                }
            },
            { $unwind: "$dataUser" },
            { $unwind: "$products" },
            {
                $lookup: {
                    "from": "products",
                    "let": { "productId": { "$toObjectId": "$products.categoryId" } },
                    "pipeline": [
                        { $unwind: "$categories" },
                        { $match: { $expr: { $eq: ["$$productId", "$categories._id"] } } },
                        { $project: { "categories": 1 } }
                    ],
                    "as": "item"
                }
            },
            { $unwind: "$item" },
            {
                $group: {
                    _id: {
                        Order_id: "$_id",
                        username: "$dataUser.username",
                        email: "$dataUser.email",
                        amount: "$amount",
                        address: "$address",
                        status: "$status"
                    },
                    item: {
                        $push: {
                            categories: "$item.categories",
                            quantity:"$products.quantity"
                        }
                    }
                }
            },
            { $match: ObjectSearch }
        ]
        ) : await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: { "userObjId": { "$toObjectId": "$userId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userObjId"] } } },
                        { $project: { "username": 1, "email": 1 } }
                    ],
                    as: "dataUser",
                }
            },
            { $unwind: "$dataUser" },
            { $unwind: "$products" },
            {
                $lookup: {
                    "from": "products",
                    "let": { "productId": { "$toObjectId": "$products.categoryId" } },
                    "pipeline": [
                        { $unwind: "$categories" },
                        { $match: { $expr: { $eq: ["$$productId", "$categories._id"] } } },
                        { $project: { "categories": 1 } }
                    ],
                    "as": "item"
                }
            },
            { $unwind: "$item" },
            {
                $group: {
                    _id: {
                        Order_id: "$_id",
                        username: "$dataUser.username",
                        email: "$dataUser.email",
                        amount: "$amount",
                        address: "$address",
                        status: "$status"
                    },
                    item: {
                        $push: {
                            categories: "$item.categories",
                            quantity:"$products.quantity"
                        }
                    }
                }
            }
        ]
        )
        res.status(200).json({
            data: listOrder,
            status: 200,
            message: "Success find Orders"
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.orderOne = async (req, res, next) => {
    try {
        const order = await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: { "userObjId": { "$toObjectId": "$userId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userObjId"] } } },
                        { $project: { "username": 1, "email": 1 } }
                    ],
                    as: "dataUser",
                }
            },
            { $unwind: "$dataUser" },
            { $unwind: "$products" },
            {
                $lookup: {
                    "from": "products",
                    "let": { "productId": { "$toObjectId": "$products.categoryId" } },
                    "pipeline": [
                        { $unwind: "$categories" },
                        { $match: { $expr: { $eq: ["$$productId", "$categories._id"] } } },
                        { $project: { "categories": 1 } }
                    ],
                    "as": "item"
                }
            },
            { $unwind: "$item" },
            {
                $group: {
                    _id: {
                        Order_id: "$_id",
                        username: "$dataUser.username",
                        email: "$dataUser.email",
                        amount: "$amount",
                        address: "$address",
                        status: "$status"
                    },
                    item: {
                        $push: {
                            categories: "$item.categories",
                            quantity:"$products.quantity"
                        }
                    }
                }
            },
            { $match: { "_id.Order_id": new moongose.Types.ObjectId(req.params.id) } }
        ]
        )
        res.status(200).json({
            data: order,
            status: 200,
            message: 'Success find Order'
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
        obj.userId = req.body.userId

        let products = []

        req.body.products.map((length, index) => {
            let objCategories = {}
            objCategories.categoryId = length.categoryId,
                objCategories.quantity = length.quantity
            products.push(objCategories)
        })

        let result = { ...obj, products: products }
        result.buktiPayment = uploadCloudinary.secure_url
        result.amount = req.body.amount
        result.address = req.body.address

        const update = await Order.findByIdAndUpdate(req.params.id, {
            $set: result
        })
        res.status(200).json({
            status: 200,
            message: 'Success updare Order'
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}
exports.delete = async (req, res, next) => {
    try {
        const deleteData = await Order.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status: 200,
            message: "success delete data"
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.payment = async (req, res, next) => {
    try {
        const uploadCloudinary = await cloudinary.uploader.upload(req.files[0].path)
        const change = await Order.updateOne({ _id: req.params.id }, {
            $set: {
                "buktiPayment": uploadCloudinary.secure_url
            }
        })
        res.status(200).json({
            status: 200,
            message: "success payment"
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.approveOrRejectPayment = async (req, res, next) => {
    try {
        const change = await Order.updateOne({ _id: req.params.id }, {
            $set: {
                "status": req.body.status
            }
        })
        res.status(200).json({
            status: 200,
            message: "success change status order"
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.historyOrders = async (req, res, next) => {
    try {

        const history = req.query.status ? await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: { "userObjId": { "$toObjectId": "$userId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userObjId"] } } },
                        { $project: { "username": 1, "email": 1 } }
                    ],
                    as: "dataUser",
                }
            },
            { $unwind: "$dataUser" },
            { $unwind: "$products" },
            {
                $lookup: {
                    "from": "products",
                    "let": { "productId": { "$toObjectId": "$products.categoryId" } },
                    "pipeline": [
                        { $unwind: "$categories" },
                        { $match: { $expr: { $eq: ["$$productId", "$categories._id"] } } },
                        { $project: { "categories": 1 } }
                    ],
                    "as": "item"
                }
            },
            { $unwind: "$item" },
            { $match: { "status": parseInt(req.query.status) } },
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        username: "$dataUser.username",
                        email: "$dataUser.email",
                        amount: "$amount"
                    },
                    history: { $push: {categories: "$item.categories",quantity:"$products.quantity"} }
                }
            },
            {
                $project: {
                    "_id.userId": 1,
                    "_id.username": 1,
                    "_id.email": 1,
                    "field": 1,
                    "_id.amount": 1,
                    "history.quantity":1,
                    "history.categories": 1
                }
            },
            {
                $group: {
                    _id: {
                        userId: "$_id.userId",
                        username: "$_id.username",
                        email: "$_id.email"
                    },
                    amountTotal: { $sum: "$_id.amount" },
                    "history": { $push: "$history" }
                }
            },
            {
                $project: {
                    "_id.userId": 1,
                    "_id.username": 1,
                    "_id.email": 1,
                    "amountTotal": 1,
                    "data": {
                        $reduce: {
                            "input": "$history",
                            "initialValue": [],
                            "in": { $setUnion: ["$$value", "$$this"] }
                        }
                    }
                }
            }

        ]) : await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: { "userObjId": { "$toObjectId": "$userId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userObjId"] } } },
                        { $project: { "username": 1, "email": 1 } }
                    ],
                    as: "dataUser",
                }
            },
            { $unwind: "$dataUser" },
            { $unwind: "$products" },
            {
                $lookup: {
                    "from": "products",
                    "let": { "productId": { "$toObjectId": "$products.categoryId" } },
                    "pipeline": [
                        { $unwind: "$categories" },
                        { $match: { $expr: { $eq: ["$$productId", "$categories._id"] } } },
                        { $project: { "categories": 1 } }
                    ],
                    "as": "item"
                }
            },
            { $unwind: "$item" },
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        username: "$dataUser.username",
                        email: "$dataUser.email",
                        amount: "$amount"
                    },
                    history: { $push: {categories: "$item.categories",quantity:"$products.quantity"} }
                }
            },
            {
                $project: {
                    "_id.userId": 1,
                    "_id.username": 1,
                    "_id.email": 1,
                    "field": 1,
                    "_id.amount": 1,
                    "history.quantity":1,
                    "history.categories": 1
                }
            },
            {
                $group: {
                    _id: {
                        userId: "$_id.userId",
                        username: "$_id.username",
                        email: "$_id.email"
                    },
                    amountTotal: { $sum: "$_id.amount" },
                    "history": { $push: "$history" }
                }
            },
            {
                $project: {
                    "_id.userId": 1,
                    "_id.username": 1,
                    "_id.email": 1,
                    "amountTotal": 1,
                    "data": {
                        $reduce: {
                            "input": "$history",
                            "initialValue": [],
                            "in": { $setUnion: ["$$value", "$$this"] }
                        }
                    }
                }
            }
        ])
        res.status(200).json({
            data: history,
            message: "success get history many users",
            status: 200
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.historyOrder = async (req, res, next) => {
    try {

        const history = await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: { "userObjId": { "$toObjectId": "$userId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$userObjId"] } } },
                        { $project: { "username": 1, "email": 1 } }
                    ],
                    as: "dataUser",
                }
            },
            { $unwind: "$dataUser" },
            { $unwind: "$products" },
            {
                $lookup: {
                    "from": "products",
                    "let": { "productId": { "$toObjectId": "$products.categoryId" } },
                    "pipeline": [
                        { $unwind: "$categories" },
                        { $match: { $expr: { $eq: ["$$productId", "$categories._id"] } } },
                        { $project: { "categories": 1 } }
                    ],
                    "as": "item"
                }
            },
            { $unwind: "$item" },
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        username: "$dataUser.username",
                        email: "$dataUser.email",
                        amount: "$amount"
                    },
                    history: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    "_id.userId": 1,
                    "_id.username": 1,
                    "_id.email": 1,
                    "field": 1,
                    "_id.amount": 1,
                    "history.item.categories": 1
                }
            },
            {
                $group: {
                    _id: {
                        userId: "$_id.userId",
                        username: "$_id.username",
                        email: "$_id.email"
                    },
                    amountTotal: { $sum: "$_id.amount" },
                    "history": { $push: "$history.item.categories" }
                }
            },
            {
                $project: {
                    "_id.userId": 1,
                    "_id.username": 1,
                    "_id.email": 1,
                    "amountTotal": 1,
                    "data": {
                        $reduce: {
                            "input": "$history",
                            "initialValue": [],
                            "in": { $setUnion: ["$$value", "$$this"] }
                        }
                    }
                }
            },
            { $match: { "_id.userId": req.params.id } }

        ])
        res.status(200).json({
            data: history,
            message: "success get history many users",
            status: 200
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}