const User = require("../models/user");
const { success } = require("../util/responseMessage");
const Controller = require("./Controller");

/**
 * UserController responsible for user endpoint
 */
class UserController extends Controller {

  /**
   * Creates Route list for RouteBuilder
   */
  static ROUTE_LIST() {
    const routes = super.ROUTE_LIST()
    delete routes.create
    return { login: { endpoint: '/login', type: 'post' }, ...routes }
  }

  // static MIDDLEWARE () {
  //   return [auth]
  // }

  static index(req) {
    return { ...success(), customMessage: 'Hi Elton!' }
  }

  static async login(req) {

    const { username, password } = req.body

    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return await User.validateUser(username, re.test(username) ? 'email' : 'phone', password)
  }

  static async store(req) {
    return await User.createEntry(req.body)
  }

}

module.exports = UserController