const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");
const http = require("http");
// const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const createSocket = require("./socket");
const router = require("./api/routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const logger = require("./db/config/logger");
const morgan = require("morgan");
app.use(
  morgan(":method :status :url :response-time ms", { stream: logger.stream }) //데이터의 통로 stream
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
      },
    },
    xContentTypeOptions: true,
    xFrameOptions: "DENY",
    referrerPolicy: "same-origin",
  })
);

app.use(
  cors({
    methods: ["GET", "POST", "UPDATE", "DELETE", "PUT", "PATCH"],
    origin: ["https://mood-classic.site", "http://localhost:3000"],
    credentials: true,
  })
);

// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", router);

app.use((error, req, res, next) => {
  logger.error(error);
  console.error(error);
  return res
    .status(error.code || 500)
    .json({ message: error.message || "서버 에러." });
});

const server = http.createServer(app);
createSocket(server);

server.listen(PORT, () => {
  logger.info(`${process.env.NODE_ENV} - API Server Listening At Port ${PORT}`);
});
