require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const flash = require('connect-flash')
const User = require('./models/user')
const bcrypt =require('bcrypt')
const session =require('express-session')
const MongoStore =require ('connect-mongo')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

mongoose.Promise = Promise;
mongoose
  .connect('mongodb://localhost/uber-for-loundry', {useMongoClient: true})
  .then(() => {
    console.log('Connected to Mongo!')
  }).catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();



//session

app.use(session({
  secret: 'anything',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000000000000000000000000000000000000000000000000000000000000000 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}))

//passport serializers

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

//passport
passport.use('local-login', new LocalStrategy((username, password, next) => {
  User.findOne({
    email:username
  }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, {
        message: "Incorrect email"
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
    
      
      return next(null, false, {
        message: "Incorrect password"
      });
    }
    
    return next(null, user);
  });
}));

//passport hash

passport.use('local-signup', new LocalStrategy({
  passReqToCallback: true
},
(req, username, password, next) => {
  // To avoid race conditions
  process.nextTick(() => {
    User.findOne({
      'username': username
    }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (user) {
        return next(null, false);
      } else {
        // Destructure the body
        const {
          username,
          email,
          password
        } = req.body;
        
        const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
        const newUser = new User({
          username,
          email,
          password: hashPass,
        });
        
        newUser.save((err) => {
          if (err) {
            next(null, false, {
              message: newUser.errors
            })
          }
          return next(null, newUser);
        });
      }
    });
  });
}));

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));




// Middleware Setup
app.use(flash());
app.use(session({ secret: 'anything' }));
app.use(passport.initialize());
app.use(passport.session());

// Express View engine setu

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.use((req, res, next) => {
  app.locals.title = 'Express - Generated with IronGenerator';
  app.locals.user = req.user;
  next();
})

const index = require('./routes/index');
app.use('/', index);
const auth = require('./routes/auth');
app.use('/', auth);
const laundry = require('./routes/laundry');
app.use('/', laundry);

module.exports = app;
