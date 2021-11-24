if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const passport = require('passport');
const localPassport = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/Yelpcamp';
const secret = process.env.SECRET || 'secretcanbebrtterthanthis';

const mongoose = require('mongoose');
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(data => {
        console.log('Connected to Database');
    })
    .catch(err => {
        console.log('Something went wrong with Mongo')
        console.log(err)
    });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); //to serve our static files
app.use(mongoSanitize()); //to senitize incoming data from mongo injection

// const store = new MongoStore({
//     url: dbUrl,
//     secret:'secretcanbebrtterthanthis',
//     touchAfter: 24 * 60 * 60
// });

// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })

app.use(
    session({
        name: 'mydemoproject', //it just change the name from which cookie will store in browser and it added an extra layer of security by default it is connect.sid
        secret,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: dbUrl,
            touchAfter: 24 * 60 * 60
        }),
        cookies: {
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //abhi ki date se one week aage
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true //in some cases it is byDefault true and it adds basic layer of security it says our cookies our only accessable through http not by javascript
            //secure: true //only allows cookies to work on https request but it will not work on local host bcz local host is http 
        }
    })
);

// const sessionConfig={
//     store,
//     name: 'mydemoproject', //it just change the name from which cookie will store in browser and it added an extra layer of security by default it is connect.sid
//     secret:'secretcanbebrtterthanthis',
//     resave:false,
//     saveUninitialized: true,
//     cookies:{
//         expires: Date.now() + 7 *24 * 60 *60 *1000, //abhi ki date se one week aage
//         maxAge: 7 *24 * 60 *60 *1000,
//         httpOnly: true //in some cases it is byDefault true and it adds basic layer of security it says our cookies our only accessable through http not by javascript
//         //secure: true //only allows cookies to work on https request but it will not work on local host bcz local host is http 
//     }
// }
// app.use(session(sessionConfig));

app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/djmubpf63/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localPassport(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user; //req.user keeps track about user's login details if not a user then it would return undefined and here we passing it to every template
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('campground/Home');
});

const campgroundRoutes = require('./routes/campgroundRoutes');
app.use('/campgrounds', campgroundRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/campgrounds/:id/reviews', reviewRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; //here we set 500 as default value
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('error', { err });

});

const port = process.env.PORT || 8080; //if we are in production then heroku automatically give us process.env.PORT otherwise in development our port is 8080

app.listen(port, () => {
    console.log(`Listening on port ${port} for Yelpcamp`);
});