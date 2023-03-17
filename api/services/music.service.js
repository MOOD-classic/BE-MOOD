const musicRepository = require("../repositories/music.repository");
const { makeError } = require("../error");

class MusicService {
  constructor() {
    this.musicRepository = new musicRepository();
  }

  findOneByMusicId = async ({ musicId }) => {
    let music = await this.musicRepository.findOneByMusicId({ musicId });
    if (music == null) {
      throw new makeError({
        message: "게시글 상세 조회를 실패하였습니다.",
        code: 400,
      });
    }
    let fileName = music.fileName;
    music.musicUrl = "https://d13uh5mnneeyhq.cloudfront.net/" + fileName;
    return music;
  };
  findAllByComposer = async ({ composer }) => {
    let music = await this.musicRepository.findAllByComposer({ composer });
    if (music == "") {
      throw new makeError({
        message: "적절하지 않은 파라미터 요청입니다.",
        code: 400,
      });
    }
    for (let i = 0; i < music.length; i++) {
      let fileN = music[i].dataValues.fileName;
      music[i].dataValues.musicUrl =
        "https://d13uh5mnneeyhq.cloudfront.net/" + fileN;
    }
    return music;
  };
  findAllByStatus = async ({ status }) => {
    let mood = await this.musicRepository.findAllByStatus({ status });
    for (let i = 0; i < mood.length; i++) {
      let fileName = mood[i].dataValues.fileName;
      mood[i].dataValues.musicUrl =
        "https://d13uh5mnneeyhq.cloudfront.net/" + fileName;
    }
    if (mood == "") {
      throw new makeError({
        message: "적절하지 않은 파라미터 요청입니다.",
        code: 400,
      });
    }
    return mood;
  };
  findBySurvey1 = async () => {
    let survey1 = await this.musicRepository.findBySurvey1();
    if (survey1 == "") {
      throw new makeError({
        message: "status 4,7,8 에 해당하는 음악이 없습니다.",
        code: 400,
      });
    }
    for (let i = 0; i < survey1.length; i++) {
      let fileName = survey1[i].dataValues.fileName;
      survey1[i].dataValues.musicUrl =
        "https://d13uh5mnneeyhq.cloudfront.net/" + fileName;
    }
    let randNum = await this.musicRepository.rand(0, survey1.length);
    let randOne = survey1[randNum].dataValues;
    return randOne;
  };
  findBySurvey2 = async () => {
    let survey2 = await this.musicRepository.findBySurvey2();
    if (survey2 == "") {
      throw new makeError({
        message: "status: 5 에 해당하는 음악이 없습니다.",
        code: 400,
      });
    }
    for (let i = 0; i < survey2.length; i++) {
      let fileName = survey2[i].dataValues.fileName;
      survey2[i].dataValues.musicUrl =
        "https://d13uh5mnneeyhq.cloudfront.net/" + fileName;
    }
    let randNum = await this.musicRepository.rand(0, survey2.length);
    let randOne = survey2[randNum].dataValues;
    return randOne;
  };
  findBySurvey3 = async () => {
    let survey3 = await this.musicRepository.findBySurvey3();
    if (survey3 == "") {
      throw new makeError({
        message: "status: 2,3,6 에 해당하는 음악이 없습니다.",
        code: 400,
      });
    }
    for (let i = 0; i < survey3.length; i++) {
      let fileName = survey3[i].dataValues.fileName;
      survey3[i].dataValues.musicUrl =
        "https://d13uh5mnneeyhq.cloudfront.net/" + fileName;
    }
    let randNum = await this.musicRepository.rand(0, survey3.length);
    let randOne = survey3[randNum].dataValues;
    return randOne;
  };
  findByKeyword = async ({ keyword }) => {
    const music = await this.musicRepository.findByKeyword({ keyword });
    if (keyword.length === 0) {
      throw new makeError({
        message: "빈 페이지 입니다.",
        code: 400,
      });
    }
    if (!music) {
      throw new makeError({
        message: "적절하지 않은 파라미터 요청입니다.",
        code: 400,
      });
    }
  };
}
module.exports = MusicService;
