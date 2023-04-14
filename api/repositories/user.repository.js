const {
  Users,
  UserInfos,
  Likes,
  Scraps,
  Chats,
  Musics,
  Reviews,
  ReComments,
} = require("../../models");
const sequelize = require("sequelize");

class UserRepository {
  signUp = async (id, password, email, nickname) => {
    const makeUser = await Users.create({ id, password, email, nickname });
    await UserInfos.create({
      userId: makeUser.userId,
      profileUrl:
        "https://d13uh5mnneeyhq.cloudfront.net/Heart_fill_white copy.png",
    });
    return makeUser;
  };

  findUser = async (userId) => {
    const findUser = await Users.findOne({ where: { userId } });

    return findUser;
  };

  login = async (id) => {
    const findUser = await Users.findOne({ where: { id } });
    return findUser;
  };

  idCheck = async (id) => {
    const idCheck = await Users.findOne({ where: { id } });
    return idCheck;
  };

  nickNameCheck = async (nickname) => {
    const nickNameCheck = await Users.findOne({ where: { nickname } });
    return nickNameCheck;
  };

  findById = async (id) => {
    const user = await Users.findOne({ where: { id } });
    return user;
  };

  findByNickname = async (nickname) => {
    const user = await Users.findOne({ where: { nickname } });
    return user;
  };

  findByEmail = async (email) => {
    const user = await Users.findOne({
      where: {
        email: email,
      },
    });

    return user;
  };

  // 테이블에 없으면 자동으로 회원가입(DB에 저장)
  autoSocialSignup = async (email, nickname, profile_image) => {
    const auto_signup_kakao_user = await Users.create({
      id: email,
      email: email,
      nickname: nickname,
    });

    const auto_signup_kakao_user_image = await UserInfos.create({
      userId: auto_signup_kakao_user.userId,
      profileUrl: profile_image,
    });

    return {
      userId: auto_signup_kakao_user.user_id,
      email: auto_signup_kakao_user.email,
      nickname: auto_signup_kakao_user.nickname,
      profileUrl: auto_signup_kakao_user_image.profileUrl,
    };
  };

  userInfo = async (userId) => {
    const findUser = await Users.findOne({ where: { userId } });
    const findUserInfo = await UserInfos.findOne({ where: { userId } });

    return {
      userId: findUser.userId,
      nickname: findUser.nickname,
      profileUrl: findUserInfo.profileUrl,
      myStatus: findUserInfo.myStatus,
    };
  };

  likeList = async (userId) => {
    const likeList = await Likes.findAll({ where: { userId } });
    return likeList;
  };

  scrapList = async (userId) => {
    const scrapList = await Scraps.findAll({ where: { userId } });
    return scrapList;
  };

  findMusic = async (musicId, page) => {
    const musicList = await Musics.findAll({
      where: { musicId },
      attributes: [
        "musicTitle",
        "musicContent",
        "composer",
        "musicUrl",
        "musicId",
      ],
      limit: 10,
      offset: (page - 1) * 10,
      order: [["musicId", "DESC"]],
    });
    const musicCount = await Musics.count({ where: { musicId } });
    return { musicList, musicCount };
  };

  findMyMusic = async (musicId) => {
    const musicList = await Musics.findAll({
      where: { musicId },
      attributes: [
        "musicTitle",
        "musicContent",
        "composer",
        "musicUrl",
        "musicId",
      ],
      order: [["musicId", "DESC"]],
    });
    const musicCount = await Musics.count({ where: { musicId } });
    return { musicList, musicCount };
  };

  myMusic = async (musicId) => {
    const musicList = await Musics.findAll({
      where: { musicId },
      attributes: [
        "musicTitle",
        "musicContent",
        "composer",
        "musicUrl",
        "musicId",
      ],
      order: [["musicId", "DESC"]],
    });
    return musicList;
  };

  uploadProfile = async (userId, fileName) => {
    await UserInfos.update({ profileUrl: fileName }, { where: { userId } });
    return;
  };

  changeNickname = async ({ userId, nickname, beforeNickname }) => {
    await Users.update({ nickname }, { where: { userId } });
    await Chats.update({ nickname }, { where: { nickname: beforeNickname } });
    return;
  };

  findReview = async (userId) => {
    const reviewData = await Reviews.findAll({
      where: { userId },
      attributes: ["musicId", "reviewId", "review", "createdAt"],
      order: [[sequelize.literal("reviewId"), "DESC"]],
    });
    return reviewData;
  };

  findRecomment = async (userId) => {
    const recommentData = await ReComments.findAll({
      where: { userId },
      attributes: [
        "reCommentId",
        "reviewId",
        ["comment", "review"],
        "createdAt",
        [sequelize.col("Review.musicId"), "musicId"],
      ],
      include: [
        {
          model: Reviews,
          as: "Review",
          attributes: [],
        },
      ],
      order: [[sequelize.literal("reCommentId"), "DESC"]],
    });
    return recommentData;
  };

  deleteUser = async (userId) => {
    await Users.destroy({ where: { userId } });
    await UserInfos.destroy({ where: { userId } });
    return;
  };

  updateUserStatus = async (userId, message) => {
    await UserInfos.update({ myStatus: message }, { where: { userId } });
    return;
  };
  savePassword = async ({ email, hashedPw }) => {
    await EmailChecks.destroy({ where: { email } });
    await EmailChecks.create({ email, password: hashedPw });
    return;
  };
  mailCheck = async ({ email }) => {
    const check = await EmailChecks.findOne({ where: { email } });
    return check;
  };
}

module.exports = UserRepository;
