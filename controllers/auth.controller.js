const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');

exports.createNewAuth = function(req, res) {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
};

exports.refreshAuth = function(req, res) {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
};

function createAuthToken(user) {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}
