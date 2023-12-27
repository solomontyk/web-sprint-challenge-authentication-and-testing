const router = require('express').Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { checkMissing, checkUsernameFree, checkSpaces, checkUsernameExists } = require("./auth-middleware")
const User = require('../users/users-model')

router.post('/register', checkMissing, checkSpaces, checkUsernameFree, (req, res, next) => {
  const { username, password } = req.body
  const hash = bcrypt.hashSync(password, 8)
  User.add({ username: username, password: hash })
    .then(created => {
      res.status(201).json(created)
    })
    .catch(next)
});

router.post('/login', checkMissing, checkUsernameExists, (req, res, next) => {
  if (bcrypt.compareSync(req.body.password, req.user.password)) {
    const token = generateToken(req.user)
    res.status(200).json({
      message: `welcome, ${req.user.username}`,
      token: token,
    })
  } else {
    next({ status: 401, message: "invalid credentials" })
  }
});

function generateToken(user) {
  const secret = process.env.SECRET || "shh"
  const output = {
    subject: user.user_id,
    username: user.username,
  }
  const options = {
    expiresIn: '1d',
  }
  return jwt.sign(output, secret, options)
}
module.exports = router;
