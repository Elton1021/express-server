/**
 * Logger a better way to log data and easier way to make changes to the log
 */
class Logger {
  /**
   * 
   * @param {Object} param
   * @param {String} param.filename
   * @param {String} param.method
   * @param {String} param.action
   * @param {String|Number|JSON} param.log
   */
  static log({ filename, method, action, log }) {
    const d = new Date()
    const date = `${d.getUTCDate()}-${d.getUTCMonth()}-${d.getUTCFullYear()}`
    console.log(
      `[${date} ${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}UTC]`,
      filename,
      method,
      action,
      'LOG',
      log
    )
  }
}

module.exports = Logger