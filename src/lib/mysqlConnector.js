const mysql = require('mysql')

/**
 * MysqlConnector an Object that sets database credentials and creates pool for MySQL Object
 */
class MysqlConnector {
  
  constructor() {
    this._pool = mysql.createPool({
      connectionLimit: this.CONNECTION_LIMIT,
      host: this.HOST,
      user: this.USERNAME,
      password: this.PASSWORD,
      database: this.DATABASE,
    });
    console.log('mysql pool created')
    console.log('@@@@@@@@@@@@@@@@@@\n')
  }

  get HOST() {
    return process.env.HOST || 'localhost'
  }

  get USERNAME() {
    return process.env.USERNAME || 'root'
  }

  get PASSWORD() {
    return process.env.PASSWORD || ''
  }

  get DATABASE() {
    return process.env.DATABASE || 'databasename'
  }

  get CONNECTION_LIMIT() {
    return process.env.CONNECTION_LIMIT || 100
  }

  get pool() {
    return this._pool
  }
}

module.exports = new MysqlConnector()