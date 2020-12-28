const responseMessage = require("../util/responseMessage")

/**
 * Restful api controller that handles
 */
class Controller {

  /**
   * Returns Routes List for RouteBuilder
   */
  static ROUTE_LIST () {
    const index = {
      endpoint: '/',
      type: 'get'
    }
    const create = {
      endpoint: '/create',
      type: 'get'
    }
    const store = {
      endpoint: '/',
      type: 'post'
    }
    const show = {
      endpoint: '/:id',
      type: 'get'
    }
    const edit = {
      endpoint: '/:id/edit',
      type: 'get'
    }
    const update = {
      endpoint: '/:id',
      type: 'put'
    }
    const destory = {
      endpoint: '/:id',
      type: 'delete'
    }
    return {
      index: { ...index },
      create: { ...create },
      store: { ...store },
      show: { ...show },
      edit: { ...edit },
      update: { ...update },
      destory: { ...destory },
    }
  }

  /**
   * Returns List of middleware for RouteBuilder
   */
  static MIDDLEWARE () {
    return []
  }

  static index() {
    return responseMessage._404()
  }

  static create() {
    return responseMessage._404()
  }

  static store() {
    return responseMessage._404()
  }

  static show() {
    return responseMessage._404()
  }

  static edit() {
    return responseMessage._404()
  }

  static update() {
    return responseMessage._404()
  }

  static delete() {
    return responseMessage._404()
  }
}

module.exports = Controller