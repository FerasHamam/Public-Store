//imports
const express = require('express');
const app = express();
const csrf = require('csurf');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
//db
const MongoUrl = "mongodb+srv://"+process.env.MONGO_USER+":"+process.env.MONGO_PASSWORD+"@cluster0.rabyk.mongodb.net/"+process.env.MONGO_DEFAULT_DATABASE+"?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const MongoDbStore = require('connect-mongodb-session')(session);
const store = new MongoDbStore({ 
    uri:MongoUrl,
    databaseName:'shop',
    collection:'sessions'
});
//
const bodyParser = require('body-parser');
const path = require('path');
//
const errorPage = require('./controllers/error');
const User = require('./models/user');
//routes
const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');
const authRouter = require('./routes/auth');
//
const fileStorage = multer.diskStorage({destination:(req,file,cb) => cb(null, 'images'),filename: (req,file,cb) => cb(null, Date.now() + '-' + file.originalname)});
const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    {
        cb(null,true);
    }
    else{
        cb(null,false);
    }
}
//dynamic content
app.set('view engine','ejs',);
app.set('views', 'views');
//
//static content
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image'));
app.use(express.static(path.join(__dirname,'public')));
app.use('/images',express.static(path.join(__dirname,'images')));
app.use(session({
    secret:'my secret',
    resave:false,
    saveUninitialized:false,
    store: store,
}));
app.use(csrf({}));
app.use(flash());
app.use((req,res,next)=>{
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id).then(user=>{
        req.user = user;
        next();
    }).catch(err => {
        const error = new Error(err);
        error.status = 500
        next(error);
      });
})

//url path
app.use('/admin',adminRouter);
app.use(authRouter);
app.use(shopRouter);
app.use(errorPage.get404);
app.use((error,req,res,next)=>{
    res.status(500).render('500.ejs',{
        pageTitle:'Error!',
        path:'/error'
    });
})
//

mongoose.connect(MongoUrl).then(result=>{
    console.log('connected');
    app.listen(process.env.port || 3000);
}).catch(err=>console.log(err));
