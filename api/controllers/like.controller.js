const LikeService = require("../services/like.service");

class LikeController {
  likeService = new LikeService();

  //좋아요 변경
  like = async (req, res, next) => {
    try {
      const { userId } = res.locals.user;
      const { musicId } = req.params;

      const like = await this.likeService.like(userId, musicId);
      const { code, message } = like;
      res.status(code).json({ message });
    } catch (error) {
      next(error);
    }
  };

  //좋아요 조회
  likeStatus = async (req, res, next) => {
    try {
      const { userId } = res.locals.user;
      const { musicId } = req.params;

      const likeStatus = await this.likeService.likeStatus(userId, musicId);
      res
        .status(200)
        .json({ message: "좋아요 조회에 성공했습니다.", likeStatus });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = LikeController;
