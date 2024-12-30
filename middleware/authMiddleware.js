const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.userId;
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Not authorized, invalid token or token expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = protect;
