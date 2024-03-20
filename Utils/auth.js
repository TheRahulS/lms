const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'you are not authorized user' });
    }
    jwt.verify(token, '122324322', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }
        req.user = decoded;
        next();
    });
};

module.exports=verifyToken
                                                                                