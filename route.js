const router = require('express').Router()
const passport = require('passport')
const auth = require("./controller/auth")
const user = require("./controller/user")
const product = require("./controller/product")
const cart = require("./controller/cart")
const order = require("./controller/order")
const {verifyJwt, verifyAdmin, verifySelf} = require("./controller/verifyJWT")
const {upload} = require("./uploadImage")

//auth
router.route("/register").post(auth.add)
router.route("/login").post(auth.login)
router.route("/forgot-password").post(auth.forgotPassword)

//user
router.route("/users/list").get(verifyAdmin,user.list)
router.route("/user/:id").get(verifyJwt, user.userOne)
router.route("/user-biodata/:id").get(verifySelf, user.userOne)
router.route("/user-update/:id").put(verifySelf, user.update)
router.route("/user-delete/:id").delete(verifyAdmin, user.delete)

//product
router.route("/product-add").post(verifyAdmin,upload.any('photo'),product.add)
router.route("/product/:id").get(product.productOne)
router.route("/products/list").get( product.list)
router.route("/product-update/:id").put(verifyAdmin,upload.any('photo'),product.update)
router.route("/product-delete/:id").delete(verifyAdmin,product.delete)

router.route("/product-add-categories/:id").post(verifyAdmin, upload.any('photo'),product.addCategories)
router.route("/product-update-categories").put(verifyAdmin ,upload.any('photo'),product.updateCategories)
router.route("/product-update-quantity").put(verifyJwt, product.incDecQuantity)
router.route("/product-update-discount").put(verifyAdmin, product.changeDiscount)
router.route("/product-get-categories").get(verifyJwt,product.getCategories)

//cart
router.route("/cart-add").post(verifyJwt,cart.add)
router.route("/carts/list").get(verifyAdmin,cart.list)
router.route("/cart/:id").get(verifyJwt, cart.cartOne)
router.route("/cart-update/:id").put(verifyJwt, cart.update)
router.route("/cart-delete/:id").delete(verifyAdmin, cart.delete)

router.route("/cart-history").get(verifyAdmin,cart.historyUsers)
router.route("/cart-history-per-user/:id").get(verifyJwt,cart.historyUser)

//order
router.route("/order-add").post(verifyJwt,order.add)
router.route("/orders/list").get(verifyAdmin,order.list)
router.route("/order/:id").get(verifyJwt,order.orderOne)
router.route("/order-update/:id").put( verifyAdmin,order.update)
router.route("/order-delete/:id").delete(verifyAdmin,order.delete)

router.route("/order-payment/:id").put(upload.any('photo'),order.payment)
router.route("/order-status/:id").put(verifyJwt,order.approveOrRejectPayment)
router.route("/order-history").get(verifyAdmin,order.historyOrder)

module.exports = router