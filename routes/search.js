const express = require('express');
const router = express.Router();
const { setToken, authenticateJWT } = require('../services/auth');
const myEventEmitter = require('../services/logEvents.js');
const pDal = require('../services/p.fulltext.dal');
// const mDal = require('../services/m.fulltext.dal'); // Keep MongoDB DAL, but comment it out for now

// Use the setToken middleware to set the JWT token from the session
router.use(setToken);

// Protect all API routes with the authenticateJWT middleware
router.use(authenticateJWT);

// Render the search page
router.get('/', async (req, res) => {
    const theResults = [];
    myEventEmitter.emit('event', 'app.get /search', 'INFO', 'search page (search.ejs) was displayed.');
    res.render('search', { status: req.session.status, theResults });
});

router.post('/', async (req, res) => {
    try {
        const searchTerm = req.body.keyword;
        const theResults = [];

        // Fetch results from PostgreSQL only
        const pResults = await pDal.getFullText(searchTerm);
        if (pResults && pResults.length > 0) {
            theResults.push(...pResults);
        }

        console.log('Search Results:', theResults); // Log the search results

        myEventEmitter.emit('event', 'app.post /search', 'INFO', 'search results displayed.');
        res.render('search', { status: req.session.status, theResults });
    } catch (error) {
        console.error(error);
        myEventEmitter.emit('event', 'app.post /search', 'ERROR', 'Error fetching search results.');
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
