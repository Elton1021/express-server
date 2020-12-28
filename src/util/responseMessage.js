const responseMessage = {
  1000: 'Success',
  1001: 'ERR: NOT_FOUND',
  1002: 'ERR: SERVER_ERROR',
  1003: 'ERR: FORBIDDEN',
  1004: 'ERR: UNAUTHORIZED',
  1005: 'Invalid credentials',
  1006: 'User Exists',
}

module.exports = {
  responseMessage,
  success: () => ({ status: 200, respCode: 1000, message: responseMessage[1000] }),
  _404: () => ({ status: 404, respCode: 1001, message: responseMessage[1001] }),
  dynamic: (status, res) => ({ status, respCode: res, message: responseMessage[res] })
}