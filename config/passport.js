var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
// comment
module.exports = function(passport){
  // Passport also needs to serialize and deserialize user instance from a session store in order to support login sessions,
  // so that every subsequent request will not contain the user credentials.
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('user-signup', new LocalStrategy({
    usernameField: 'signup_username',
    passwordField: 'signup_password',
    passReqToCallback: true
  },
  function(req, username, password, done){
    process.nextTick(function(){
      User.findOne({'username': username}, function(err, user){
        if(err) return done(err);

        if(user){
          console.log("test");
          return done(null, false, req.flash('message', 'That email is already in use.'));
        }
        else {
         var newUser = new User();
         newUser.name = req.body.name;
         newUser.description = "Enter your description here";
         newUser.username = username;
         newUser.password = newUser.generateHash(password);
         newUser.headerImage = "/img/default_headerImage.jpg";
         newUser.profileImage = "/img/default_profile.png";
         newUser.admin = false;
         newUser.save(function(err){
           if (err) throw err;

           console.log('User added');
           return done(null, newUser);
         });
       }
     });
   });
 }));

 passport.use('user-login', new LocalStrategy({
   usernameField: 'username',
   passwordField: 'password',
   passReqToCallback: true,
 },
 function(req, username, password, done){
   User.findOne({'username': username}, function(err, user){
     if(err) return done(err);

     if(!user)
      return done(null, false, req.flash('message', 'No user found with username ' + username));
     if(!user.validPassword(password))
      return done(null, false, req.flash('message', 'Wrong password please try again'));

     return done(null, user);
   });
 }
));
};
