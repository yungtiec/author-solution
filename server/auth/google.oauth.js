'use strict';

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../api/users/user.model');
var crypto = require('crypto');



var decipher = crypto.createDecipher('aes-256-ctr', 'app secret')
var clientID = decipher.update(passport.hash.clientIdHash,'hex','utf8')
clientID += decipher.final('utf8');

var decipher2 = crypto.createDecipher('aes-256-ctr', 'app secret')
var clientSecret = decipher2.update(passport.hash.clientSecretHash,'hex','utf8')
clientSecret += decipher2.final('utf8');

module.exports = new GoogleStrategy({
  clientID: clientID,
  clientSecret: clientSecret,
  callbackURL: '/auth/google/callback'
}, function (token, refreshToken,  profile, triggerSerializationOfUser) {
  // this only runs when somebody logs in through google
  User.findOrCreate({
    where: {googleId: profile.id},
    defaults: {
      email: profile.emails[0].value,
      name: profile.displayName,
      photo: profile.photos[0].value
    }
  })
  .spread(function (user) {
    triggerSerializationOfUser(null, user);
  })
  .catch(triggerSerializationOfUser);
});
