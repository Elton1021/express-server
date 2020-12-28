const bcrypt = require('bcrypt')

/**
 * Bcrypt: using the orginal bcrypt package with dynamic salt generation based on env
 */
class Bcrypt {

  /**
   * Generates Salt for hashing
   */
  static getSalt() {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(+process.env.SALT_SIZE, (err, salt) => {
        if (err) {
          reject(err)
        }
        resolve(salt)
      })
    })
  }

  /**
   * Converts String to bcrypt hash
   * @param {String} secret that is to be hashed
   */
  static hash(secret) {
    return new Promise(async (resolve, reject) => {
      const salt = await this.getSalt()
      bcrypt.hash(secret, salt, (err, hash) => {
        if (err) {
          reject(err)
        }

        resolve(hash)
      })
    })
  }

  /**
   * Compares normal string with bcrypt hash
   * @param {String} hash bcrypt hash param
   * @param {String} normal normal String that is to be compared with the hash
   */
  static compare(hash, normal) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(normal, hash, (err, isMatch) => {
        if (err) {
          return reject(err)
        }
        if (!isMatch) {
          return reject(false)
        }  
        return resolve(true)
      })
    })
  }
}

module.exports = Bcrypt