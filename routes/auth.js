const express = require('express');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { addLogin, getLoginByUsername } = require('../services/p.auth.dal'); // Ensure correct path

const DEBUG = process.env.DEBUG || false;

// Serve static files
router.use(express.static('public'));

// Login page
router.get('/', (req, res) => {
    if (DEBUG) console.log('login page: ');
    res.render('login', { status: req.session.status });
});

// Login user
router.post('/', async (req, res) => {
    try {
        if (DEBUG) console.log('auth.getLoginByUsername().try');
        let user = await getLoginByUsername(req.body.username);
        if (DEBUG) console.log(`user data: ${user ? user.username : 'not found'}`);
        if (!user) {
            req.session.status = 'Incorrect username was entered.';
            res.redirect('/auth');
            return;
        }
        if (await bcrypt.compare(req.body.password, user.password)) {
            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '3m' });
            if (DEBUG) {
                console.log(`curl -H "Authorization: Bearer ${token}" -X GET http://localhost:3000/api/auth/${user._id}`);
                console.log(`curl -d "password=xxxxx" -H "Authorization: Bearer ${token}" -X POST http://localhost:3000/api/auth/${user._id}`);
                console.log(`curl -H "Authorization: Bearer ${token}" -X DELETE http://localhost:3000/api/auth/${user._id}`);
            }
            req.session.user = user;
            req.session.token = token;
            req.session.status = 'Happy for your return ' + user.username;
            res.redirect('/');
        } else {
            req.session.status = 'Incorrect password was entered.';
            res.redirect('/auth');
        }
    } catch (error) {
        console.log(error);
        if (DEBUG) console.log('auth.getLoginByUsername().catch: ' + error.message);
        res.render('503');
    }
});

// Display register page
router.get('/new', (req, res) => {
    res.render('register', { status: req.session.status });
});

// Register new user
router.post('/new', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        if (req.body.email && req.body.username && req.body.password) {
            var result = await addLogin(req.body.username, req.body.email, hashedPassword, uuid.v4());
            if (DEBUG) console.log('result: ' + result);
            if (result.code === "23505" || result.code === 11000) {
                let constraint;
                function setConstraint(indexName) {
                    const constraintsMap = {
                        "unique_username": "Username",
                        "unique_email": "Email address"
                    };
                    return constraintsMap[indexName] || indexName;
                }

                if (result.code === "23505") {
                    constraint = setConstraint(result.constraint);
                } else if (result.code === 11000) {
                    if (DEBUG) console.log(result.errmsg);
                    const match = result.errmsg.match(/index: (\w+)/);
                    const indexName = match ? match[1] : 'unknown';
                    if (DEBUG) console.log(`Duplicate key error for index: ${indexName}`);
                    constraint = setConstraint(indexName);
                }
                req.session.status = `${constraint} already exists, please try another.`;
                res.redirect('/auth/new');
            } else {
                req.session.status = 'New account created, please login.';
                res.redirect('/auth');
            }
        } else {
            req.session.status = 'Not enough form fields completed.';
            res.redirect('/auth/new');
        }
    } catch (error) {
        console.log(error);
        res.render('503');
    }
});

// Clear the session
router.get('/exit', (req, res) => {
    if (DEBUG) console.log('get /exit');
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction error:", err);
            return res.status(500).send("Could not log out.");
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;
