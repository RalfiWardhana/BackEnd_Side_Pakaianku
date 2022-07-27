const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const dotenv = require('dotenv')
const app = express()
const router = require('./route')
const JWT = require('jsonwebtoken')
const User = require("./model/user")
const passport = require("passport")
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { ObjectId } = require('mongodb');
let session = require('express-session')

dotenv.config()

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('DB Connected')
    })
    .catch((err) => {
        console.log(err)
    })

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', router)
app.use("/uploads",express.static("uploads"))

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((user, done) => {
    done(null, user)
})

passport.use(new GoogleStrategy({
    clientID: "413268921795-9lbtm9j69evq9hp2pqdanftcvr0mmt1m.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "https://pakaianku.herokuapp.com/google/callback"
},

    async (request, accessToken, refreshToken, profile, done) => {
        try {
            let existingUser = await User.findOne({ 'username': profile.displayName, 'email': profile.emails[0].value });
            // if user exists return the user 
            if (existingUser) {
                return done(null, existingUser);
            }
            // if user does not exist create a new user 
            const newUser = new User({
                username: profile.displayName,
                email: profile.emails[0].value
            });
            await newUser.save();

            return done(null, newUser);
        } catch (error) {
            return done(error, false)
        }
    }
));

app.get('/', (req, res) => {
    console.log("test")
    res.status(200).json({
        "test": "ini test"
    })
})

app.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    async (req, res) => {
        try {
            const token = JWT.sign({
                id: req.user._id,
                isAdmin: req.user.isAdmin
            },
             process.env.JWT_SEC, 
            { expiresIn: "1d" })
            res.status(200).json({
                message: "Login Success",
                user:req.user,
                token:token
            })
        } catch(err) {
            console.log(err)
            return res.status(500).json({
                message:"error"
            })
        }
    })

app.listen(process.env.PORT || 5000, () => {
    console.log(`API is running in ${process.env.PORT || 5000}`)
})