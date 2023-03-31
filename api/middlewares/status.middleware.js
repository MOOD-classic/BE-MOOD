const jwt = require("jsonwebtoken");
const { Users } = require("../../db/models");
const { v4: uuidv4 } = require("uuid");

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const [tokenType, token] = (authorization ?? "").split(" ");

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
      const userId = decodedToken.userId;
      const user = await Users.findOne({ where: { userId } });

      res.locals.user = user;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(403).send("엑세스 토큰이 만료되었습니다.");
        return;
      } else if (error instanceof jwt.JsonWebTokenError) {
        // JWT 형식이 아닌 경우 처리
        res.locals.user = { userId: uuidv4() };
      } else {
        next(error);
      }
    }
  } else {
    res.locals.user = { userId: uuidv4() };
  }
  next();
};
