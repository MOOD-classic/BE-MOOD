const {
  Musics,
  Composers,
  Likes,
  Streamings,
  Tags,
  MusicTags,
} = require("../../db/models");
const { makeError } = require("../error");
const { S3 } = require("aws-sdk");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const redisClient = require("../../db/config/redisClient");

class MusicRepository {
  constructor() {}
  create = async ({
    musicTitle,
    musicContent,
    status,
    composer,
    tag,
    musicUrl,
  }) => {
    let music = await Musics.create({
      musicTitle,
      musicContent,
      status,
      composer,
      tag,
      musicUrl,
    });
    if (tag) {
      const tagList = tag.split(",");
      for (const tag of tagList) {
        const tags = await Tags.findOrCreate({
          where: { tagName: tag.trim() },
        });
        const musicTags = await MusicTags.create({
          musicId: music.musicId,
          tagId: tags[0].tagId,
        });
        if (!musicTags) {
          throw new makeError({
            message: "태그 생성에 실패하였습니다.",
            code: 400,
          });
        }
      }
    }
    return music;
  };
  findOneByMusicId = async ({ musicId }) => {
    let music = await Musics.findOne({
      where: { musicId },
      attributes: [
        "musicTitle",
        "musicContent",
        "composer",
        "musicUrl",
        "musicId",
        "fileName",
      ],
    });
    return music;
  };
  findAllByComposer = async ({ composer }) => {
    let composerInfo = await Composers.findAll({
      where: composer,
    });
    let music = await Musics.findAll({
      where: { composer: composer.composer.split(" ").slice(-1) },
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
    const mood = await Musics.findOne({
      order: Sequelize.literal("rand()"),
      where: { status },
      // include: [
      //   {
      //     model: Composers,
      //     as: "Composer",
      //     targetKey: "composer",
      //     attributes: ["imageUrl"],
      //   },
      // ],
    });
    return mood;
  };

  findByKeyword = async ({ keyword }) => {
    const composerInfo = await Composers.findOne({
      where: {
        [Op.or]: [{ composer: keyword }, { tag: { [Op.substring]: keyword } }],
      },
    });
    let composerName = "";
    if (composerInfo) {
      composerName = composerInfo.composer.split(" ");
    }
    const composerSong = await Musics.findAll({
      where: {
        composer: composerName.slice(-1),
      },
      order: [["musicTitle", "DESC"]],
      attributes: [
        "musicId",
        "composer",
        "musicTitle",
        "musicContent",
        "fileName",
        "musicUrl",
      ],
    });

    const musicTitle = await Musics.findAll({
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
        "fileName",
        "musicUrl",
        "tag",
      ],
    });
    return { composerInfo, composerSong, musicTitle };
  };

  likeChart = async () => {
    const likeChart = await Musics.findAll({
      attributes: [
        "musicId",
        "musicTitle",
        "composer",
        "musicUrl",
        "fileName",
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
      order: [[Sequelize.literal("likesCount"), "DESC"]],
      limit: 10,
    });

    return likeChart;
  };

  streamingChart = async () => {
    const scrapChart = await Musics.findAll({
      attributes: [
        "musicId",
        "musicTitle",
        "composer",
        "musicUrl",
        "fileName",
        [
          Sequelize.fn("COUNT", Sequelize.col("Streamings.musicId")),
          "streamingCount",
        ],
      ],
      include: [
        {
          model: Streamings,
          attributes: [],
          duplicating: false,
        },
      ],
      group: ["Musics.musicId"],
      order: [[Sequelize.literal("streamingCount"), "DESC"]],
      limit: 10,
    });

    return scrapChart;
  };

  sendStreaming = async (userId, musicId) => {
    const streaming = await Streamings.create({ userId, musicId });
    return streaming;
  };

  tagMusicId = async ({ musicId, tag }) => {
    console.log(tag);
    const tagList = tag.split(",");
    for (const tag of tagList) {
      const tags = await Tags.findOrCreate({
        where: { tagName: tag.trim() },
      });
      const musicTags = await MusicTags.create({
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
