const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

// Register
router.post('/register', (req, res, next) => {
  // res.send('in register');
  let newUser = new User ({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  User.addUser(newUser, (err, user) => {
    if(err) {
      // res.json({success: false, msg: 'User email'});
      res.status(400).json({
        message: "Invalid authentication credentials!"
      });      
    } else {
      res.status(201).json({
        message: "User created!"
      });
    }
  });
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  // console.log(req.body.username);

  User.getUserByUsername(username, (err, user) => {
    console.log(user);
    if(err) {
      throw err;
    }
    
    if(!user) {
      return res.json({success: false, msg: 'User not found here'});
    }
    
    if(!password) {
      return res.json({success: false, msg: 'Password is needed'});
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      console.log('im in compare password');
      if(err) {
        
        throw err;
      }
      if(isMatch) {
        const token = jwt.sign({data: user}, config.secret, {
          expiresIn: 604800 // 1 week
        });
        res.json({
          success: true,
          token: 'JWT ' + token,
          user: userData(user)
        })
      } else {
        return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
});

var userData = function(user) {
  var userPlain = {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email    
  }
  return userPlain;
};

// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  console.log('i am in profile');
  
  res.json(userData(req.user));
});

module.exports = router;
