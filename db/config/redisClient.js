const Redis = require("ioredis");
require("dotenv").config();

const redisClient = new Redis({
  host: "127.0.0.1" || process.env.REDIS_HOST,
  port: 6379 || process.env.REDIS_PORT,
});

redisClient.on("connect", () => {
  console.info("Redis connected!");
});
redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

module.exports = redisClient;
