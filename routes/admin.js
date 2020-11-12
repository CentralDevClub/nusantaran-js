const express = require('express');
const router = express.Router();

router.get('/admin',(req,res,next)=>{
    res.send('<h1>Admin</h1>');
});

module.exports = router;