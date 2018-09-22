const express = require('express');
const router  = express.Router();
const User = require('../models/user')
const LaundryPickup = require('../models/laundry-pickup')


/* GET home page */


//PICKUPS
router.get('/dashboard', (req, res, next) => {
    let query;
    
    if (req.user.isLaunderer) {
        query = { launderer: req.user._id };
    } else {
        query = { user: req.user._id };
    }
    
    console.log(query);
    LaundryPickup
      .find(query)
      .populate('username', 'name')
      .populate('launderer', 'name')
      .sort('pickupDate')
      .exec((err, pickupDocs) => {
        if (err) {
          next(err);
          return;
        }
  
        res.render('laundry/dashboard', {pickups: pickupDocs});
      });
  });
 
  //become launderer
router.post('/launderers', (req, res, next) => {
   
    
    const userId = req.user._id
    
    const laundererInfo = {
      fee: req.body.fee,
      isLaunderer: true
    };
  
    User.findByIdAndUpdate(userId, laundererInfo, { new: true }, (err, user) => {
      if (err) {
        next(err);
        return;
      }

      res.redirect('/dashboard');
    });
  });

    //get list
  router.get('/launderers', (req, res, next) => {
    User.find({ isLaunderer: true }, (err, launderersList) => {
      if (err) {
        next(err);
        return;
      }
      res.render('laundry/launderers', {
        launderers: launderersList
      });
    });
  });

  //schedule
  router.get('/launderers/:id', (req, res, next) => {
    const laundererId = req.params.id;
  
    User.findById(laundererId, (err, theUser) => {
      if (err) {
        next(err);
        return;
      }
  
      res.render('laundry/launderer-profile', {
        theLaunderer: theUser
      });
    });
  });


  router.post('/laundry-pickups', (req, res, next) => {
      
      const pickupInfo = {
          pickupDate: req.body.pickupDate,
          launderer: req.user.laundererId,
          user: req.user.username
        }
        console.log(pickupInfo);
  
    const thePickup = new LaundryPickup(pickupInfo);
  
    thePickup.save((err) => {
      if (err) {
        next(err);
        return;
      }
  
      res.redirect('/dashboard');
    });
  });

module.exports = router;