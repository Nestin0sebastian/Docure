var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require('bcrypt');
const session = require('express-session');

//d1



const port = 3003;

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

var app = express();                    

//session
app.use(session({
  secret: 'keyboard cat',
  resave:false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//mongo db connected
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/Docure", {
  useNewUrlParser: true,  
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.once("open", () => {
  console.log("MongoDB connection successful!");
});
  

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  const user= {}
  res.status(err.status || 500);
  res.status(500).send('Internal Server Error');
});

module.exports = app;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
