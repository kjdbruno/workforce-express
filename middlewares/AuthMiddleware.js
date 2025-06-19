const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // const token = req.headers['authorization'];
    // if (!token) return res.status(403).json({ error: 'No token provided' });

    // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    //     if (err) return res.status(500).json({ error: 'Failed to authenticate token' });
    //     req.userId = decoded.id;
    //     next();
    // });
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Assuming "Bearer TOKEN" format
    if (!token) {
        return res.status(403).json({ error: 'Token not properly formatted' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Specific error messages for better debugging
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired', message: 'Your session has expired. Please log in again.' });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: 'Failed to authenticate token', message: 'Invalid token. Please log in again.' });
            }
            return res.status(500).json({ error: 'Failed to authenticate token', message: 'An unexpected authentication error occurred.' });
        }
        req.userId = decoded.id; // Store decoded user ID in request
        next();
    });
};

exports.validateApiKey = (req, res, next) => {
    const apiKey = req.headers['api'];
    if (!apiKey) {
        return res.status(403).json({ error: 'API key is missing' });
    }
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
};