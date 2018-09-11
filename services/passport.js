const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const keys = require('../config/keys')

const User = mongoose.model('users')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    if (user) {
      done(null, user)
    } else {
      done('error not found', null)
    }
  })
})

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true, // otherwise google will reset https to http when proxy is in middle
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id })
        .then(existingUser => {
          if (existingUser) {
            done(null, existingUser)
          } else {
            new User({ googleId: profile.id })
              .save()
              .then(user => {
                done(null, user)
              })
              .catch(err => {
                console.log('sub', err)
              })
          }
        })
        .catch(err => {
          console.log('main', err)
        })
    }
  )
)
