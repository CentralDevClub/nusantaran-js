const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// View Enigner
const app = express();
app.set('view engine','ejs');
app.set('views','views');

const shopRoute = require('./routes/shop');
const adminRoute = require('./routes/admin').adminRoutes;

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

app.use(shopRoute);
app.use('/admin',adminRoute);

app.use((req,res,next)=>{
    res.render('404',{
        'title':'Nusantaran JS | Page Not Found'
    });
});

console.log(`Server running at http://127.0.0.1:3000`);
app.listen(3000);