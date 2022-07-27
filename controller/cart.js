const moongose = require('mongoose')
const Cart = require("../model/cart")
const User = require("../model/user")
const { CustomError } = require('../helper/errorHandler')

exports.add = async (req, res, next) => {
    try {
        const cartAdd = new Cart(req.body)
        const add = await cartAdd.save()
        res.status(201).json({
            message: "Success to add cart",
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
        const listCart = Object.keys(ObjectSearch).length !== 0 ? await Cart.aggregate([
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
                        cart_id: "$_id",
                        username: "$dataUser.username",
                        email: "$dataUser.email"
                    },
                    item: {
                        $push: {
                            categories: "$item.categories"
                        }
                    }
                }
            },
            { $match: ObjectSearch }
        ]
        ) : await Cart.aggregate([
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
                        cart_id: "$_id",
                        username: "$dataUser.username",
                        email: "$dataUser.email"
                    },
                    item: {
                        $push: {
                            categories: "$item.categories"
                        }
                    }
                }
            }
        ]
        )
        res.status(200).json({
            data: listCart,
            status: 200,
            message: "Success find carts"
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.cartOne = async (req, res, next) => {
    try {
        const cart = await Cart.aggregate([
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
                        cart_id: "$_id",
                        username: "$dataUser.username",
                        email: "$dataUser.email"
                    },
                    item: {
                        $push: {
                            categories: "$item.categories"
                        }
                    }
                }
            },
            { $match: { "_id.cart_id": new moongose.Types.ObjectId(req.params.id) } }
        ]
        )
        res.status(200).json({
            data: cart,
            status: 200,
            message: 'Success find cart'
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.update = async (req, res, next) => {
    try {
        const update = await Cart.findByIdAndUpdate(req.params.id, {
            $set: req.body
        })
        res.status(200).json({
            status: 200,
            message: 'Success updare cart'
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}
exports.delete = async (req, res, next) => {
    try {
        const deleteData = await Cart.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status: 200,
            message: "success delete data"
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.historyUser = async (req, res, next) => {
    try {
        const history = await Cart.aggregate([
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
                    },
                    history: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    "_id.userId": 1,
                    "_id.username": 1,
                    "_id.email": 1,
                    "history.item.categories": 1
                }
            },
            {$match:{"_id.userId":req.params.id}}
        ]) 
        res.status(200).json({
            data: history,
            message: "success get history user",
            status: 200
        })
    } catch (err) {
        console.log(err)
        return next(new CustomError('Something went wrong, please try again later!', 500))
    }
}

exports.historyUsers = async (req, res, next) => {
    try {
        const history = await Cart.aggregate([
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
                    },
                    history: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    "_id.userId": 1,
                    "_id.username": 1,
                    "_id.email": 1,
                    "history.item.categories": 1
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