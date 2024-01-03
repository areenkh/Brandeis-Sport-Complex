const httpStatus = require("http-status-codes");
module.exports = {
  pageNotFoundError : (req, res) => {
  let errorCode = httpStatus.NOT_FOUND;
  res.status(errorCode);
  res.send(`${errorCode} | Page Not Found!`);
},
internalServerError : (error, req, res, next) => {
  let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
  console.log(`ERROR occurred: ${error.stack}`);
  res.status(errorCode);
  res.send(`${errorCode} | Sorry, there is a problem in our application!`);
}};