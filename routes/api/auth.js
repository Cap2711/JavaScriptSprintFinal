const bcrypt = require('bcrypt');
const uuid = require('uuid');
var router = require('express').Router();
const pgDal = require('../../services/p.auth.dal');
const mongoDal = require('../../services/m.auth.dal');
const DEBUG = process.env.DEBUG || false;

// api/auth/register
// register a new user
router.post('/register', async (req, res) => {
    if(DEBUG) console.log('ROUTE: /api/auth/register POST ' + req.url);
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            uuid: uuid.v4()
        };

        // Add user to PostgreSQL
        const pgUserId = await pgDal.addLogin(newUser.username, newUser.email, newUser.password, newUser.uuid);

        // Add user to MongoDB
        const mongoUserId = await mongoDal.addLogin(newUser.username, newUser.email, newUser.password, newUser.uuid);

        res.status(201).json({ message: "User registered", pgUserId: pgUserId, mongoUserId: mongoUserId });
    } catch (error) {
        console.log('auth.register().catch: ' + error);
        res.status(503).json({ message: "Service Unavailable", status: 503 });
    }
});

// api/auth/:id
// fetch the specific login by id
router.get('/:id', async (req, res) => {
    if(DEBUG) console.log('ROUTE: /api/auth/:id GET ' + req.url);
    try {
        let aLogin = await pgDal.getLoginById(req.params.id); 
        if (!aLogin) {
            res.status(404).json({message: "Not Found", status: 404});
        } else {
            res.json(aLogin);
        }
    } catch (error) {
        console.log(error); // Log the error
        res.status(503).json({message: "Service Unavailable", status: 503});
    }
});

// reset the password
router.patch('/:id', async (req, res) => {
    if(DEBUG) console.log('ROUTE: /api/auth PATCH ' + req.params.id);
    try {
        let aLogin = await pgDal.getLoginById(req.params.id); 
        if (!aLogin) {
            res.status(404).json({message: "Not Found", status: 404});
        } else {  
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                await pgDal.patchLogin(req.params.id, aLogin.username, hashedPassword, aLogin.email);
                await mongoDal.patchLogin(req.params.id, aLogin.username, hashedPassword, aLogin.email);
                res.status(200).json({message: "OK", status: 200});
            } catch (error) {
                console.log(error); // Log the error
                res.status(500).json({message: "Internal Server Error", status: 500});
            }
        }   
    } catch (error) {
        console.log(error); // Log the error
        res.status(503).json({message: "Service Unavailable", status: 503});
    }
});

// delete the login 
router.delete('/:id', async (req, res) => {
    if(DEBUG) console.log('ROUTE: /api/auth DELETE ' + req.params.id);
    try {
        await pgDal.deleteLogin(req.params.id);
        await mongoDal.deleteLogin(req.params.id);
        res.status(200).json({message: "OK", status: 200});
    } catch (error) {
        console.log(error); // Log the error
        res.status(503).json({message: "Service Unavailable", status: 503});
    }
});

module.exports = router;
