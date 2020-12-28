const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs');
const logger = require('./lib/logger');
const { basename } = require('path');
const RouteBuilder = require('./lib/routeBuilder');
const { _404 } = require('./util/responseMessage');

/**
 * App creates an express app
 */
class App {
  constructor(projectName) {
    logger.log({filename: basename(__filename), method: 'constructor', action: 'start', log: `\nStarting ${projectName}` })
    this._app = express()

    this.setup()
  }

  get corsOption () {
    return {}
  }

  /**
   * Gets list of files available in route folder
   */
  getRoutesName() {
    return new Promise((resolve, reject) => {
      fs.readdir(process.env.ROUTES_DIR, (err, files) => {
        if (err) {
          reject(err)
        }

        resolve(files)
      })
    })
  }

  /**
   * Gets route controller
   * @param {String} route name of the route module to require
   */
  getRoute(route) {
    try {
      return require(route)
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * Sets express middlewares and routes
   */
  async setup() {
    logger.log({ filename: basename(__filename), method: 'setup', action: 'start', log: 'Setting up app...\n' })

    // Set cors
    this._app.use(cors(this.corsOption))

    // Apply body parser
    this._app.use(bodyParser.json())

    // Get list of routes
    const routes = await this.getRoutesName()
    if (routes) {
      for (const route of routes) {
        try {
          const controller = this.getRoute(`./routes/${route}`)
          if (controller) {
            // Dynamically creates and sets routers and middleware
            this._app.use(`/${route.split('.js')[0]}`, new RouteBuilder(controller).router)
          }
        } catch (err) {
          logger.log({ filename: basename(__filename), method: 'setup', action: 'catch error', log: err })
        }
      }
    }

    // Sends 404 error for undefined routes
    this._app.use((_, res) => res.send(_404()))
    logger.log({ filename: basename(__filename), method: 'setup', action: 'end', log: '\nAll set to go....\n' })
  }


  /**
   * Starts the express app
   */
  async start() {

    this._app.listen(process.env.PORT || 3000, () => {
      logger.log({
        filename: basename(__filename),
        method: 'start',
        action: 'listen',
        log: `\n\nListening to ${process.env.PORT || 3000}\n` +
          '=================\n' +
          `env: ${process.env.NODE_ENV}\n`
      })
    })
  }
}

const app = new App("ELTON'S EXPRESS-SERVER")
app.start()