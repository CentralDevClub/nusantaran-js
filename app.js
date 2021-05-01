require('dotenv').config()
const express = require('express')
const Pool = require('pg').Pool
const connection = new Pool(require('./models/connection'))
const session = require('express-session')
const store = new (require('connect-pg-simple')(session))({ pool: connection })
const bodyParser = require('body-parser')
const multer = require('multer')
const multerConfig = require('./util/multer-config')
const path = require('path')
const csrf = require('csurf')
const generalData = require('./middleware/generalData')
const flash = require('connect-flash')

// Import Routing & Controller
const shopRoute = require('./routes/shop')
const adminRoute = require('./routes/admin')
const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')
const errorController = require('./controllers/error')

// View Engine
const app = express()
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(bodyParser.urlencoded({ extended: false }))

app.use(multer({
    storage: multerConfig.fileStorage,
    fileFilter: multerConfig.fileFilter
}).single('image'))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    store: store
}))

// CSRF Protection
app.use(csrf())

// Flash message
app.use(flash())

// General Data Used in Middleware
app.use(generalData)

// Page Routing
app.use(shopRoute)
app.use(authRoute)
app.use(userRoute)
app.use('/admin', adminRoute)
app.get('/500', errorController.get500)
app.use(errorController.get404)

// Server error middleware
app.use((error, _req, res, _next) => {
    console.log(error)
    res.status(500).render('500', {
        'title': 'Nusantaran JS | Server Error',
        'path': '/500',
        'isAuthenticated': false
    })
})

// Running Server
const port = process.env.PORT || 3000
const deploy = process.env.IP_DEPLOY || '127.0.0.1'
app.listen(port, deploy)
console.log(`Server is deployed on http://${deploy}:${port}`)