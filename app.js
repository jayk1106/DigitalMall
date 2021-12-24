const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const session = require('express-session');
const MongodbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const User = require('./models/user');

const MONGODB_URL = "mongodb+srv://jay:jayme143@cluster0.0a5mx.mongodb.net/digitalMall"

const app = express();
const store = new MongodbStore({
  uri : MONGODB_URL ,
  collection : 'session'
});


const fileStrorage = multer.diskStorage({
  destination : (req,file,cb) => {
    cb(null,'images');
  },
  filename : (req,file,cb)=>{
    console.log("FileStorage : ",req.session.user._id + '-' + Date.now() + '-' +file.originalname);
    cb(null , req.session.user._id + '-' + Date.now() + '-' +file.originalname);
  }
})

const fileFilter = (req,file,cb) => {
  console.log(file.mimetype);
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null,true);
  }else{
    cb(null,false);
  }
}

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use( '/images' ,express.static("images"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret : 'longstringforhasing' , resave: false , saveUninitialized: false , store:store}));
app.use(multer({storage : fileStrorage , fileFilter: fileFilter}).single('image'));

app.use(csrf());

app.use(flash());

// Set locals variables that present in all views so we don't need to render every time
app.use((req,res,next) => {
  res.locals.isAthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})


app.use((req,res,next) => {
  if(req.session.user){
  User.findById(req.session.user._id)
   .then( user => {
     if(!user) return next();
    req.user = user;
    next();
  })
  .catch( err => {
    res.redirect('/500');
  })
  }else{
    next();
  }
  
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500' , (req,res,next) => {
    res.status(500).render('500');
})

app.use((req,res,next)=> {
    res.status(404).render('404');
})



mongoose
  .connect(MONGODB_URL)
  .then((result) => {
    app.listen(3001, () => {
      console.log("Server running on port 3001");
    });
  })
  .catch((err) => {
    console.log(err);
  });
