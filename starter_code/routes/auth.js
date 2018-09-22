const express = require('express');
const router  = express.Router();
const User = require('../models/user')
const passport = require('passport');
const session =require('express-session')

const flash = require('connect-flash')
const {ensureLoggedIn, ensureLoggedOut} = require('connect-ensure-login')

/* GET home page */
router.get('/login', (req, res, next) => {

    console.log(req.session)
  res.render('auth/login');
});

router.post('/login', ensureLoggedOut(), passport.authenticate('local-login', {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash: true
  }))

  router.get('/signup', (req, res, next) => {
    res.render('auth/signup');
  });
  
  router.post('/signup', ensureLoggedOut(), passport.authenticate('local-signup', {
      successRedirect : '/login',
      failureRedirect : '/signup',
      failureFlash : true
    }));

  router.get('/logout', ensureLoggedIn(), (req,res) => {
          req.logout();
          res.redirect('/')
  })

  
module.exports = router;