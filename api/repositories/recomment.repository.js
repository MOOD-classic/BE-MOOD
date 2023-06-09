const { Users, ReComments } = require("../../db/models/");

class ReCommnetRepository {
  constructor() {}
  //대댓글 작성
  addReviewComment = async ({ userId, reviewId, comment }) => {
    const result = await ReComments.create({ userId, reviewId, comment });
    return result;
  };

  //대댓글 조회
  getReviewComment = async ({ reviewId }) => {
    const result = await ReComments.findAll({
      where: { reviewId },
      include: [
        {
          model: Users,
          attributes: ["nickname"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return result;
  };

  //대댓글 상세 조회
  existReComment = async ({ reCommentId }) => {
    const result = await ReComments.findOne({
      where: { reCommentId },
    });
    return result;
  };

  //대댓글 수정
  updateReviewComment = async ({ reCommentId, comment }) => {
    await ReComments.update({ comment }, { where: { reCommentId } });
    return;
  };

  //대댓글 삭제
  deleteReviewComment = async ({ reCommentId }) => {
    await ReComments.destroy({ where: { reCommentId } });
    return;
  };
}

module.exports = ReCommnetRepository;
