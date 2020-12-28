const jwt = require('jsonwebtoken')

const { dynamic } = require("../util/responseMessage")

const User = require("../models/user")

/**
 * Authentication Middleware responsible to check jwt
 * @param {*} req Request
 * @param {*} res Response
 * @param {*} next next method
 */
module.exports = (req, res, next) => {
  const authorization = req.headers['X-AUTH-TOKEN']
  if (!authorization) {
    return res.send(dynamic(400, 1003))
  }

  const token = authorization.replace('Bearer ','')
  jwt.verify(token, process.env.SECRET_KEY, async (err, payload) => {
    if (err) {
      return res.send(dynamic(400, 1003))
    }

    const { userId } = payload

    const user = await User.findById(userId)
    req.user = user
    next()
  })
}