const logger = require('./logger')
const mysqlConnector = require('./mysqlConnector')
const { basename } = require('path');

/**
 * MySQL is a wrapper that carries out the common functionalities of mysql package asynchronously
 */
class MySQL {

  /**
   * Gets connection from the pool
   */
  static getConnection() {
    return new Promise((resolve, reject) => {
      mysqlConnector.pool.getConnection((err, connection) => {
        if (err) {
          reject(err)
        }

        logger.log({ filename: basename(__filename), method: 'getConnetion', action: 'getConnection', log: `Thread #${connection.threadId}` })
        resolve(connection)
      })
    })
  }

  /**
   * Ends the pool
   */
  static end() {
    return new Promise((resolve, reject) => {
      mysqlConnector.pool.end(err => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }

  /**
   * RawQuery with connection will return the database results
   * @param {Object} connection 
   * @param {String} query 
   */
  static rawQuery(connection, query) {
    return new Promise((resolve, reject) => {
      connection.query(query, [], (err, rows) => {
        if (err) {
          reject(err)
        }

        resolve(rows)
      })
    })
  }

  /**
   * Sets temporary connection for a single query execution
   * @param {String} sql executes this query
   */
  static async query(sql) {
    // Get connection
    let connection = await this.getConnection()

    // Gets result
    const result = (await this.rawQuery(connection, sql))

    // Releases Connection
    con.release()
    logger.log({ filename: basename(__filename), method: 'query', action: 'release', log: 'query temp connection released' })

    return result
  }

  /**
   * Rollback data
   * @param {Object} connection 
   */
  static rollback(connection) {
    return new Promise((resolve, reject) => {
      try {
        connection.rollback(() => resolve())
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Begins Transaction
   * @param {Object} connection
   */
  static beginTransaction(connection) {
    return new Promise((resolve, reject) => {
      connection.beginTransaction(err => {
        if (err) {
          reject(err)
        }

        resolve(connection)
      })
    })
  }

  /**
   * Commits data must be called after data insertion is complete
   * @param {Object} connection 
   */
  static commit(connection) {
    return new Promise((resolve, reject) => {
      connection.commit(err => {
        if (err) {
          reject(err)
        }

        resolve(connection)
      })
    })
  }

  /**
   * Inserts data into table if tablename is passed or MySQL object is extended
   * @param {Object} param
   * @param {String} param.tablename name of the table
   * @param {Object} param.data data to be inserted in table
   * @param {Object} connection 
   */
  static async insert({ tablename, data }, connection) {
    const dynamicQuery = (data) => {
      const values = []
      const columns = []
      for (const column of Object.keys(data)) {
        columns.push(column)
        values.push(data[column])
      }
      return [`(${columns.join(',')})`, `("${values.join('","')}")`]
    }
    let columns = ''
    let values = ''
    if (Array.isArray(data)) {
      for (const d of data) {
        const [c, v] = dynamicQuery(d)
        columns = c
        values += v
      }
    } else {
      const [c, v] = dynamicQuery(data)
      columns = c
      values += v
    }

    const sql = `INSERT INTO ${tablename || this.TABLENAME} ${columns} VALUES ${values}`
    const result = connection ? await this.rawQuery(connection, sql) : await this.query(sql)
    return result
  }

  /**
   * Updates data into table if tablename is passed or MySQL object is extended
   * @param {Object} param
   * @param {String} param.tablename name of the table
   * @param {Object} param.data data to be updated in table
   * @param {Object} param.id id of data that is to be updated in table
   * @param {Object} connection 
   */
  static async update({ tablename, data, id }, connection) {
    const dynamicQuery = (data) => {
      const columns = []
      for (const column of Object.keys(data)) {
        columns.push(`${column} = "${data[column]}"`)
      }
      return `${columns.join(', ')}`
    }

    const sql = `UPDATE ${tablename || this.TABLENAME} SET ${dynamicQuery(data)} WHERE ${this.PRIMARY_KEY} = "${id}"`
    const result = connection ? await this.rawQuery(connection, sql) : await this.query(sql)
    return result
  }

  /**
   * Deletes data into table if tablename is passed or MySQL object is extended
   * @param {Object} param
   * @param {String} param.tablename name of the table
   * @param {Object} param.id id of data that is to be deleted in table
   * @param {Object} connection 
   */
  static async delete({ tablename, id }, connection) {
    const sql = `DELETE FROM ${tablename || this.TABLENAME} WHERE ${this.PRIMARY_KEY} = "${id}"`
    const result = connection ? await this.rawQuery(connection, sql) : await this.query(sql)
    return result
  }

  /**
   * Finds data from table if tablename is passed or MySQL object is extended
   * @param {String|Number} id id of data that is to be updated in table
   * @param {Object} param
   * @param {String} param.tablename name of the table
   * @param {Object} param.params columns to be returned
   * @param {Object} param.where column to addressed in where clause
   * @param {Object} connection 
   */
  static async findById(id, { params, tablename, where }, connection) {
    const sql = `SELECT ${params ? params.join(',') : '*'} FROM ${tablename || this.TABLENAME} WHERE ${where || this.PRIMARY_KEY} = "${id}"`
    const result = connection ? await this.rawQuery(connection, sql) : await this.query(sql)
    return result
  }
}

module.exports = MySQL