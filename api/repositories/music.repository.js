const { makeError } = require("../error");
const { S3 } = require("aws-sdk");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const redisClient = require("../../db/config/redisClient");

class MusicRepository {
  constructor(
    musicModel,
    composerModel,
    likeModel,
    streamingModel,
    tagModel,
    musicTagModel
  ) {
    this.musicModel = musicModel;
    this.composerModel = composerModel;
    this.likeModel = likeModel;
    this.streamingModel = streamingModel;
    this.tagModel = tagModel;
    this.musicTagModel = musicTagModel;
  }
  create = async ({ musicTitle, musicContent, status, composer, musicUrl }) => {
    let music = await this.musicModel.create({
      musicTitle,
      musicContent,
      status,
      composer,
      musicUrl,
    });
    return music;
  };
  createTag = async ({ musicId, tag }) => {
    const tags = await this.tagModel.findOrCreate({
      where: { tagName: tag.trim() },
    });
    await this.musicTagModel.create({
      musicId,
      tagId: tags[0].tagId,
    });
  };
  findOneByMusicId = async ({ musicId }) => {
    let music = await this.musicModel.findOne({
      where: { musicId },
      attributes: [
        "musicTitle",
        "musicContent",
        "composer",
        "musicUrl",
        "musicId",
      ],
    });
    return music;
  };
  findAllByComposer = async ({ composer }) => {
    let composerInfo = await this.composerModel.findAll({
      where: composer,
    });
    let music = await this.musicModel.findAll({
      where: { composer: composer.composer.split(" ").slice(-1) },
      attributes: [
        "musicTitle",
        "musicContent",
        "composer",
        "musicUrl",
        "musicId",
        [Sequelize.fn("COUNT", Sequelize.col("Likes.musicId")), "likesCount"],
      ],
      include: [
        {
          model: Likes,
          attributes: [],
          duplicating: false,
        },
      ],
      group: ["Musics.musicId"],
    });
    return { composerInfo, music };
  };
  s3Upload = async (file) => {
    const s3 = new S3();
    const param = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.originalname,
      Body: file.buffer,
    };
    return s3.upload(param).promise();
  };

  findOneByStatus = async (status) => {
    const mood = await this.musicModel.findOne({
      order: Sequelize.literal("rand()"),
      where: { status },
      attributes: [
        "musicId",
        "musicTitle",
        "musicContent",
        "musicUrl",
        "composer",
        // [Sequelize.col("Composer.imageUrl"), "imageUrl"],
      ],
      // include: [
      //   {
      //     model: Composers,
      //     attributes: [],
      //   },
      // ],
    });
    return mood;
  };

  findByKeyword = async ({ keyword }) => {
    const composerInfo = await this.composerModel.findOne({
      where: {
        [Op.or]: [{ composer: keyword }, { tag: { [Op.substring]: keyword } }],
      },
    });
    let composerName = "";
    if (composerInfo) {
      composerName = composerInfo.composer.split(" ");
    }
    const composerSong = await this.musicModel.findAll({
      where: {
        composer: composerName.slice(-1),
      },
      order: [["musicTitle", "DESC"]],
      attributes: [
        "musicId",
        "composer",
        "musicTitle",
        "musicContent",
        "musicUrl",
        [Sequelize.fn("COUNT", Sequelize.col("Likes.musicId")), "likesCount"],
      ],
      include: [
        {
          model: Likes,
          attributes: [],
          duplicating: false,
        },
      ],
      group: ["Musics.musicId"],
    });

    const musicTitle = await this.musicModel.findAll({
      include: [
        {
          model: MusicTags,
          include: [
            {
              model: Tags,
              attributes: [],
            },
          ],
          attributes: [],
        },
        {
          model: Likes,
          attributes: [],
          duplicating: false,
        },
      ],
      order: [["musicTitle", "DESC"]],
      where: {
        [Op.or]: [
          { musicTitle: { [Op.substring]: keyword } },
          { "$MusicTags.Tag.tagName$": keyword },
        ],
      },
      attributes: [
        "musicId",
        "composer",
        "musicTitle",
        "musicContent",
        "musicUrl",
        [Sequelize.fn("COUNT", Sequelize.col("Likes.musicId")), "likesCount"],
      ],
      group: ["Musics.musicId"],
    });
    return { composerInfo, composerSong, musicTitle };
  };

  likeChart = async () => {
    const likeChart = await this.musicModel.findAll({
      attributes: [
        "musicId",
        "musicTitle",
        "composer",
        "musicUrl",
        [Sequelize.fn("COUNT", Sequelize.col("Likes.musicId")), "likesCount"],
        [Sequelize.col("Composer.imageUrl"), "imageUrl"],
      ],
      include: [
        {
          model: Likes,
          attributes: [],
          duplicating: false,
        },
        {
          model: Composers,
          attributes: [],
        },
      ],
      group: ["Musics.musicId"],
      order: [[Sequelize.literal("likesCount"), "DESC"]],
      limit: 10,
    });

    return likeChart;
  };

  streamingChart = async () => {
    const scrapChart = await this.musicModel.findAll({
      attributes: [
        "musicId",
        "musicTitle",
        "composer",
        "musicUrl",
        [
          Sequelize.fn("COUNT", Sequelize.col("Streamings.musicId")),
          "streamingCount",
        ],
        [Sequelize.col("Composer.imageUrl"), "imageUrl"],
      ],
      include: [
        {
          model: Streamings,
          attributes: [],
          duplicating: false,
        },
        {
          model: Composers,
          attributes: [],
        },
      ],
      group: ["Musics.musicId"],
      order: [[Sequelize.literal("streamingCount"), "DESC"]],
      limit: 10,
    });

    return scrapChart;
  };

  sendStreaming = async (userId, musicId) => {
    const streaming = await this.streamingModel.create({ userId, musicId });
    return streaming;
  };

  tagMusicId = async ({ musicId, tag }) => {
    const tagList = tag.split(",");
    for (const tag of tagList) {
      const tags = await this.tagModel.findOrCreate({
        where: { tagName: tag.trim() },
      });
      const musicTags = await this.musicTagModel.create({
        musicId: musicId,
        tagId: tags[0].tagId,
      });
      if (!musicTags) {
        throw new makeError({
          message: "태그 생성에 실패하였습니다.",
          code: 400,
        });
      }
    }
    return tagList;
  };

  getChartData = async (cacheKey) => {
    try {
      const data = await redisClient.get(cacheKey);
      if (!data) {
        console.log("No data found in Redis.");
        return null;
      } else {
        return JSON.parse(data);
      }
    } catch (err) {
      console.error("Redis get error: ", err);
      return null;
    }
  };

  setCache = async (processedLikeChart, cacheKey) => {
    await redisClient.set(
      cacheKey,
      JSON.stringify(processedLikeChart),
      "EX",
      60 * 60
    );
    return;
  };
}

module.exports = MusicRepository;
