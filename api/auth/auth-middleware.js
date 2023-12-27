const User = require('../users/users-model')

function checkMissing(req, res, next) {
    if (!req.body.username ||
        req.body.username.trim().length === 0 ||
        !req.body.password ||
        req.body.password.trim().length === 0
        ) {
            next({ status: 422, message: "username and password required" })
        } else {
            next()
        }
}

function checkSpaces(req, res, next) {
    const { username, password } = req.body
    const cleanUsername = req.body.username.trim()
    const cleanPassword = req.body.password.trim()
    if (username.length !== cleanUsername.length ||
        password.length !== cleanPassword.length
        ) {
            next({ status: 422, message: "fields can't include spaces" })
        } else {
            next()
        }
}

async function checkUsernameFree(req, res, next) {
    try {
        const users = await User.findBy({ username: req.body.username })
        if (!users.length) {
            next()
        } else {
            next({ status: 400, message: "username taken" })
        }
    } catch (err) {
        next(err)
    }
}

async function checkUsernameExists(req, res, next) {
    try {
        const users = await User.findBy({ username: req.body.username })
        if (users.length) {
            req.user = users[0]
            next()
        } else {
            next({ status: 401, message: "invalid credentials" })
        }
    } catch (err) {
        next(err)
    }
}

module.exports = {
    checkMissing,
    checkSpaces,
    checkUsernameFree,
    checkUsernameExists,
}