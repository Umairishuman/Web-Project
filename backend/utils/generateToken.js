const jwt = require('jsonwebtoken');

const generateToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? process.env.JWT_REMEMBER_EXPIRES_IN : process.env.JWT_EXPIRES_IN;
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = generateToken;
