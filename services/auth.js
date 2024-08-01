const jwt = require('jsonwebtoken');

// Middleware to set JWT token from session
function setToken(req, res, next) {
    const token = req.session.token;
    if (token) {
        req.headers['authorization'] = `Bearer ${token}`;
    }
    next();
}

// Middleware to authenticate JWT token
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
}

module.exports = {
    setToken,
    authenticateJWT,
};
