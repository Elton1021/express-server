const express = require('express')
const responseMessage = require('../util/responseMessage')

/**
 * RouteBuilder creates express routers dynamically based on controller specifications
 */
class RouteBuilder {

  /**
   * Sets Router based on the controller passed
   * @param {Controller} controller 
   */
  constructor(controller) {
    this.controller = controller
    this._router = express.Router()

    // Set Router
    this.setMiddleware()
    this.setRoutes()
  }

  /**
   * Sets global Middleware if mentioned in Controller.MIDDLEWARE()
   */
  setMiddleware() {
    // Gets Middleware
    const globalMiddleware = this.controller.MIDDLEWARE()
    if (globalMiddleware.length > 0) {
      // Sets global middleware
      this._router.use(...globalMiddleware)
    }
  }

  /**
   * Sets Route if mentioned in Controller.ROUTE_LIST()
   */
  setRoutes() {
    // Gets Route list
    const routeList = this.controller.ROUTE_LIST()

    for (const _route in routeList) {
      // Get Route Object
      const route = routeList[_route]

      /**
       * Express Route Function that will be set for each routes
       * @param {*} req 
       * @param {*} res 
       */
      const routeModule = async (req, res) => {
        try {
          // Call the route function
          const resp = await this.controller[_route](req, res)
          return res.send(resp || { status: 500, respCode: 1002, message: responseMessage.responseMessage[1002] })
        } catch (err) {
          console.log(err)
          res.status(500).send({ status: 500, respCode: 1002, message: responseMessage.responseMessage[1002] })
        }
      }
      // Check if route specific middleware exist
      if (route.middleware) {
        // if exist then apply and set route
        this._router[route.type](route.endpoint, route.middleware, routeModule)
      } else {
        // Set basic express route
        this._router[route.type](route.endpoint, routeModule)
      }
    }
  }

  get router() {
    return this._router
  }
}

module.exports = RouteBuilder