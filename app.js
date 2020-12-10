// Import Libraries
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

require('dotenv').config();

// Import Routing & Controller
const shopRoute = require('./routes/shop');
const adminRoute = require('./routes/admin');
const errorController = require('./controllers/error');

// View Engine
const app = express();
app.set('view engine','ejs');
app.set('views','views');
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

// Page Routing
app.use(shopRoute);
app.use('/admin',adminRoute);
app.use(errorController.get404);

// Running Server
const port = process.env.PORT || 3000;
app.listen(3000, ()=>{
    console.log(`Server running at http://127.0.0.1:${port}`);
});