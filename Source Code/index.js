const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const minifyHTML = require('express-minify-html');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const md5 = require('md5');
const { MONGODB_URI, PORT, SESSION_SECRET } = require('./config/secret');
const { ensureAuthenticated } = require('./config/auth');
const PostCategory = require('./models/PostCategory');

// Initialize app
const app = express();

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const fileName = md5(Date.now()) + path.extname(file.originalname).toLowerCase();
        cb(null, fileName);
    }
});

global.upload = multer({ storage: storage });

// Passport
require('./config/passport')(passport);

// EJS
app.set('view engine', 'ejs');

// Disable x-powered-by
app.disable('x-powered-by');

// Static files
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));

// Minify HTML
app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true
    }
}));

// Morgan
app.use(morgan('dev'));

// Compress resources
app.use(compression());

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express session
app.use(session({ secret: SESSION_SECRET, cookie: { maxAge: 6000000 }, resave: true, saveUninitialized: false }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
const FroalaEditor = require('./node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor');
app.post('/tai-len', function (req, res) {
    FroalaEditor.Image.upload(req, '/uploads/', function(err, data) {
        if (err) {
            return res.send(JSON.stringify(err));
        }

        data['link'] = data['link'].replace('uploads/', '');
        res.send(data);
    });
  });

app.use('/', require('./controllers/home'));
app.use('/bang-dieu-khien', ensureAuthenticated, require('./controllers/admin'));
app.use(async (req, res, next) => {
    const allPostCategories = await PostCategory.find({ show_on_menu: 1, is_active: 1 });

    res.render('home/pages/404', { 
        page_title: 'Không tìm thấy nội dung - LoveHue',
        post_categories: allPostCategories,
        user: req.user
    });
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true }).then(
    () => {
        app.listen(PORT, (error) => {
            if (!error)
                console.log(`Server started listening on port ${ PORT }...`);
            else
                throw new Error(error);
        });
    },
    err => { throw new Error(error) }
);