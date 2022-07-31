const moongose = require('mongoose')
const Cart = require("../model/cart")
const User = require("../model/user")
const { CustomError } = require('../helper/errorHandler')

exports.add = async (req, res, next) => {
    try {
        const userCart = await Cart.findOne({ userId: req.body.userId, active: true })
        console.log(userCart.products)
        if (userCart.products.length > 0) {

            let objCategories = {}
            objCategories.categoryId = req.body.products.categoryId,
            objCategories.quantity = req.body.products.quantity
            console.log(objCategories)
            const updateCart = await Cart.updateOne({
                userId: req.body.userId, active: true
            }, {
                $push: {
                    products: objCategories
                }
            })
        }
        else {

            let obj = {}
            obj.userId = req.body.userId
            obj.active = true
            let products = []

            let objCategories = {}
            objCategories.categoryId = req.body.products.categoryId,
            objCategories.quantity = req.body.products.quantity
            products.push(objCategories)

            let result = { ...obj, products: products }
            const cartAdd = new Cart(result)
            const add = await cartAdd.save()
        }
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
                            categories: "$item.categories",
                            quantity: "$products.quantity"
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
                            categories: "$item.categories",
                            quantity: "$products.quantity"
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
                            categories: "$item.categories",
                            quantity: "$products.quantity"
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

exports.incQuantity = async (req, res, next) => {
    try {
        const lastCartId = await Cart.find({ userId: req.body.userId }).sort({ createdAt: -1 })

        const updateQuantity = await Cart.updateOne({
            _id: lastCartId[0]._id,
            userId: req.body.userId,
            active: true,
            products: {
                $elemMatch: {
                    categoryId: req.body.products.categoryId
                }
            }
        }
            ,
            {
                $inc: {
                    "products.$.quantity": 1
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

exports.decQuantity = async (req, res, next) => {
    try {
        const result = await Cart.aggregate([
            { $unwind: "$products" },
            {
                $match: {
                    "userId": req.body.userId,
                    "products.categoryId": req.body.products.categoryId
                }
            },
            { $sort: { createdAt: -1 } }
        ])
        const lastCartId = result[0]._id
        const quantity = result[0].products.quantity

        if (quantity == 1) {
            const updateQuantity = await Cart.updateOne({
                _id: lastCartId,
                userId: req.body.userId,
                active: true,
                products: {
                    $elemMatch: {
                        categoryId: req.body.products.categoryId
                    }
                }
            }
                ,
                {
                    $pull: {
                        products: { _id: result[0].products._id }
                    }
                }
            )
        }
        else {
            const updateQuantity = await Cart.updateOne({
                _id: lastCartId,
                userId: req.body.userId,
                products: {
                    $elemMatch: {
                        categoryId: req.body.products.categoryId
                    }
                }
            }
                ,
                {
                    $inc: {
                        "products.$.quantity": -1
                    }
                }
            )
        }
        res.status(201).json({
            message: "success to update quantity",
            status: 201
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
                    history: { $push: { categories: "$item.categories", quantity: "$products.quantity" } }
                }
            },
            { $match: { "_id.userId": req.params.id } }
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
                    history: { $push: { categories: "$item.categories", quantity: "$products.quantity" } }
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