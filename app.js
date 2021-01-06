// Import Libraries
require('dotenv').config();
const chalk = require('chalk');
const express = require('express');
const Pool = require('pg').Pool;
const connection = new Pool(require('./models/connection'));
const session = require('express-session');
const store = new (require('connect-pg-simple')(session))({pool:connection});
const bodyParser = require('body-parser');
const path = require('path');
const csrf = require('./middleware/csrf');
const generalData = require('./middleware/generalData');

// Import Routing & Controller
const shopRoute = require('./routes/shop');
const adminRoute = require('./routes/admin');
const authRoute = require('./routes/auth');
const errorController = require('./controllers/error');

// View Engine
const app = express();
app.set('view engine','ejs');
app.set('views','views');
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 30 * 24 * 60 * 60 * 1000},
    store: store
}));

// CSRF Protection
app.use(csrf.protection);

// General Data Used in Middleware
app.use(generalData);

// Page Routing
app.use(shopRoute);
app.use(authRoute);
app.use('/admin',adminRoute);
app.use(errorController.get404);

// Running Server
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(chalk.underline.green(`Server is deployed on port ${port}`));
});