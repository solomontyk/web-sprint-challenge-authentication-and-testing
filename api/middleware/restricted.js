const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.headers.authorization
  const secret = process.env.SECRET || "shh"
  if (!token) {
    return next({ status: 401, message: 'token required' })
  }
  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      next({ status: 401, message: 'token invalid' })
    } else {
      req.decodedToken = decodedToken
      next()
    }
  })
};