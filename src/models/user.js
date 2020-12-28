const logger = require("../lib/logger");
const jwt = require('jsonwebtoken')
const MySQL = require("../lib/mysqlWrapper");
const Bcrypt = require("../util/bcrypt");
const { basename } = require('path');
const { success, dynamic } = require("../util/responseMessage");

/**
 * User model that contains all the core functionalities which will be useful for database interaction
 */
class User extends MySQL {
  // Set TABLENAME
  static TABLENAME = 'users'

  // Set PRIMARY_KEY
  static PRIMARY_KEY = 'id'

  /**
   * Validates whether the user exists and whether the credentials are correct
   * @param {String} username username that is to be check in db
   * @param {'email'|'phone'} type whether the username is email or phone
   * @param {String} password 
   */
  static async validateUser(username, type, password) {
    logger.log({ filename: basename(__filename), method: 'validateUser', action: 'request', log: { username, type } })
    // Get connection
    const connection = await this.getConnection()
    try {
      // Find user by username type
      const user = await this.findById(username, { where: type }, connection)
      logger.log({ filename: basename(__filename), method: 'validateUser', action: 'user', log: user.length })

      if (user.length > 0) {
        // Compare password
        const validCredentials = await Bcrypt.compare(user[0].password, password)
        if (validCredentials) {
          // Get Login timestamp
          const last_login = this.getDate()

          // Update Last login
          await this.update({ data: { last_login }, id: user[0][this.PRIMARY_KEY] }, connection)

          // Get JSON Web Token
          const token = this.getToken({ userId: user[0][this.PRIMARY_KEY], last_login })
          return { ...success(), token }
        }
      }

      return dynamic(400, 1005)

    } catch (err) {
      logger.log({ filename: basename(__filename), method: 'validateUser', action: 'error', log: err })
    } finally {
      // Release Connection
      connection.release()
    }
  }

  /**
   * Gets JSON Web Token
   * @param {Object} data 
   * @param {number} data.userId
   * @param {String} data.last_login
   */
  static getToken(data) {
    return jwt.sign(data, process.env.SECRET_KEY)
  }

  /**
   * Gets Date in Y-m-d H:i:s
   */
  static getDate() {
    const date = new Date()
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  }

  /**
   * Creates Database entry for user
   * @param {Object} param req.body
   * @param {String} param.name
   * @param {String} param.email
   * @param {String} param.phone
   * @param {String} param.password
   */
  static async createEntry({ name, email, phone, password }) {
    logger.log({ filename: basename(__filename), method: 'createEntry', action: 'request', log: { name, email, phone } })
    // Hash password And get connection
    password = await Bcrypt.hash(password)
    const connection = await this.getConnection()
    try {
      // Check if email or phone already exist
      const userExistResponse = await this.userExists({ email, phone }, connection)
      if (userExistResponse.status != 200) {
        return userExistResponse
      }

      // Get last login timestamp
      const last_login = this.getDate()
      await this.beginTransaction(connection)

      // Insert Data
      const { insertId: id } = await this.insert({
        data: {
          name,
          email,
          last_login,
          phone,
          password
        }
      }, connection)
      await this.commit(connection)

      // Get JSON Web Token
      const token = this.getToken({ userId: id, last_login })
      return { ...success(), token }
    } catch (err) {
      await this.rollback(connection)
      logger.log({ filename: basename(__filename), method: 'createEntry', action: 'error', log: err })
    } finally {
      // Release Connection
      connection.release()
    }
  }

  /**
   * Returns success if user doesn't exist
   * @param {Object} param 
   * @param {String} param.email 
   * @param {String} param.phone 
   * @param {Object} connection 
   */
  static async userExists({ email, phone }, connection) {
    const sql = `Select * from users where email = '${email}' or phone = '${phone}'`
    const user = connection ? await User.rawQuery(connection, sql) : await this.query(sql)
    if (user.length > 0) {
      return dynamic(400, 1006)
    }
    return success()
  }
}

module.exports = User