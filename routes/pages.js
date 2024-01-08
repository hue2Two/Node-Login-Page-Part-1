const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth')

router.get('/', authController.isLoggedIn, (req, res) => {
    res.render('index', {
        user: req.user
    });
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/profile', authController.isLoggedIn, (req, res) => {
    //if this exists, we did token check, grabbed user from db
    if (req.user) {
        res.render('profile', {
            user: req.user
        })

    } else {
        res.redirect('/login')
    }
    //now if no token, redirected to login

    // res.render('profile')
})

//to protect profile route, we want to do a check before
//res.render to make sure user is logged in (token to user)

//create isLoggedIn func

module.exports = router;