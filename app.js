const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const shopRoute = require('./routes/shop');
const adminRoute = require('./routes/admin');

app.use(bodyParser.urlencoded({extended:false}));

app.use(shopRoute);
app.use(adminRoute);

app.listen(3000);