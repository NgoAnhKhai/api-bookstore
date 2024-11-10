var express = require("express");
const cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");

var app = express("cors");
require("dotenv").config();
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
// Bắt các yêu cầu không khớp với bất kỳ route nào
app.use((req, res, next) => {
  const exception = new Error("Path not found");
  exception.statusCode = 404;
  next(exception); // Chuyển lỗi đến middleware tiếp theo
});
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send(err.message);
});
module.exports = app;
