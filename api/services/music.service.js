const musicRepository = require("../repositories/music.repository");
const LikeRepository = require("../repositories/like.repository");
const { makeError } = require("../error");
const {
  cloudfront,
  cloudfrontfor,
} = require("../middlewares/cloudfront.middleware");
class MusicService {
  constructor() {
    this.musicRepository = new musicRepository();
  }
  likeRepository = new LikeRepository();

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
  findAllByComposer = async ({ userId, composer }) => {
    let music = await this.musicRepository.findAllByComposer({ composer });
    if (music == "") {
      throw new makeError({
        message: "적절하지 않은 파라미터 요청입니다.",
        code: 400,
      });
    }
    for (let i = 0; i < music.music.length; i++) {
      const Like = await this.likeRepository.findLike(
        userId,
        music.music[i].musicId
      );
      if (!Like) {
        music.music[i].dataValues.likeStatus = false;
      } else {
        music.music[i].dataValues.likeStatus = true;
      }
    }
    return await cloudfrontfor(music);
  };
  mood = async ({ x, y }) => {
    if (x >= 0 && x <= 25 && y >= 0 && y <= 25) {
      if (x == 25 && y == 25) {
        let find9101314 = await this.musicRepository.find9101314();
        const data = await cloudfront(find9101314);
        return { data, msg: "당신은 조금의 불만족을 느끼는 것 같아요." };
      } else if (x == 25 && y == 0) {
        let find13and14 = await this.musicRepository.find13and14();
        const data = await cloudfront(find13and14);
        return { data, msg: "당신은 조금 우울해 보입니다.." };
      } else if (x == 0 && y == 25) {
        let find9and13 = await this.musicRepository.find9and13();
        const data = await cloudfront(find9and13);
        return { data, msg: "당신은 우울해 보입니다." };
      }
      let thirteen = await this.musicRepository.findOneByStatus13();
      const data = await cloudfront(thirteen);
      return { data, msg: "당신은 약간 우울해 보입니다." };
    } else if (x > 25 && x <= 50 && y >= 0 && y <= 25) {
      if (x == 50 && y == 25) {
        let find10111415 = await this.musicRepository.find10111415();
        const data = await cloudfront(find10111415);
        return { data, msg: "당신은 조금 불만족을 느끼는 것 같아요." };
      } else if (x == 50 && y == 0) {
        let find14and15 = await this.musicRepository.find14and15();
        const data = await cloudfront(find14and15);
        return { data, msg: "당신은 불만족을 느끼는 것 같아요." };
      }
      let fourteen = await this.musicRepository.findOneByStatus13();
      const data = await cloudfront(fourteen);
      return { data, msg: "당신은 약간의 불만족을 느끼는 것 같아요." };
    } else if (x > 50 && x <= 75 && y >= 0 && y <= 25) {
      if (x == 75 && y == 25) {
        let find11121516 = await this.musicRepository.find11121516();
        const data = await cloudfront(find11121516);
        return { data, msg: "당신은 조금의 만족감을 느끼는 것 같아요." };
      } else if (x == 75 && y == 0) {
        let find15and16 = await this.musicRepository.find15and16();
        const data = await cloudfront(find15and16);
        return { data, msg: "당신은 만족감을 느끼는 것 같아요." };
      }
      let fifteen = await this.musicRepository.findOneByStatus15();
      const data = await cloudfront(fifteen);
      return { data, msg: "당신은 약간의 만족감을 느끼는 것 같아요." };
    } else if (x > 75 && x <= 100 && y >= 0 && y <= 25) {
      if (x == 100 && y == 25) {
        let find12and16 = await this.musicRepository.find12and16();
        const data = await cloudfront(find12and16);
        return { data, msg: "당신은 기분이 좋아 보입니다." };
      }
      let sixteen = await this.musicRepository.findOneByStatus16();
      const data = await cloudfront(sixteen);
      return { data, msg: "당신은 약간 기분이 좋아 보입니다." };
    } else if (x >= 0 && x <= 25 && y > 25 && y <= 50) {
      if (x == 0 && y == 50) {
        let find5and9 = await this.musicRepository.find5and9();
        const data = await cloudfront(find5and9);
        return { data, msg: "당신은 조금 불안해하는 모습이네요." };
      } else if (x == 25 && y == 50) {
        let find56910 = await this.musicRepository.find56910();
        const data = await cloudfront(find56910);
        return { data, msg: "당신은 불안해하는 모습이네요." };
      }
      let nine = await this.musicRepository.findOneByStatus9();
      const data = await cloudfront(nine);
      return { data, msg: "당신은 상당히 불안해하는 모습이네요." };
    } else if (x > 25 && x <= 50 && y > 25 && y <= 50) {
      if (x == 50 && y == 50) {
        let find671011 = await this.musicRepository.find671011();
        const data = await cloudfront(find671011);
        return { data, msg: "당신은 불편해 보입니다." };
      }
      let ten = await this.musicRepository.findOneByStatus10();
      const data = await cloudfront(ten);
      return { data, msg: "당신은 조금 불편해 보입니다." };
    } else if (x > 50 && x <= 75 && y > 25 && y <= 50) {
      if (x == 75 && y == 50) {
        let find781112 = await this.musicRepository.find781112();
        const data = await cloudfront(find781112);
        return { data, msg: "당신은 편안해 보입니다.." };
      }
      let eleven = await this.musicRepository.findOneByStatus11();
      const data = await cloudfront(eleven);
      return { data, msg: "당신은 조금 편안해 보입니다." };
    } else if (x > 75 && x <= 100 && y > 25 && y <= 50) {
      if (x == 100 && y == 50) {
        let find8and12 = await this.musicRepository.find8and12();
        const data = await cloudfront(find8and12);
        return { data, msg: "당신은 만족해하는 모습이네요." };
      }
      let twelve = await this.musicRepository.findOneByStatus12();
      const data = await cloudfront(twelve);
      return { data, msg: "당신은 상당히 만족해하는 모습이네요." };
    } else if (x >= 0 && x <= 25 && y > 50 && y <= 75) {
      if (x == 0 && y == 75) {
        let find1and5 = await this.musicRepository.find1and5();
        const data = await cloudfront(find1and5);
        return { data, msg: "당신은 화가 나 보입니다." };
      } else if (x == 25 && y == 75) {
        let find1256 = await this.musicRepository.find1256();
        const data = await cloudfront(find1256);
        return { data, msg: "당신은 분노를 느끼고 계시네요." };
      }
      let five = await this.musicRepository.findOneByStatus5();
      const data = await cloudfront(five);
      return { data, msg: "당신은 정말 화가 나 보입니다." };
    } else if (x > 25 && x <= 50 && y > 50 && y <= 75) {
      if (x == 50 && y == 75) {
        let find2367 = await this.musicRepository.find2367();
        const data = await cloudfront(find2367);
        return { data, msg: "당신은 조금 편안해 보입니다." };
      }
      let six = await this.musicRepository.findOneByStatus6();
      const data = await cloudfront(six);
      return { data, msg: "당신은 조금 불편해 보입니다." };
    } else if (x > 50 && x <= 75 && y > 50 && y <= 75) {
      if (x == 75 && y == 75) {
        let find3478 = await this.musicRepository.find3478();
        const data = await cloudfront(find3478);
        return { data, msg: "당신은 정말 행복해 보입니다." };
      }
      let seven = await this.musicRepository.findOneByStatus7();
      const data = await cloudfront(seven);
      return { data, msg: "당신은 기쁜 모습이네요." };
    } else if (x > 75 && x <= 100 && y > 50 && y <= 75) {
      if (x == 100 && y == 75) {
        let find4and8 = await this.musicRepository.find4and8();
        const data = await cloudfront(find4and8);
        return { data, msg: "당신은 행복해 보입니다." };
      }
      let eight = await this.musicRepository.findOneByStatus8();
      const data = await cloudfront(eight);
      return { data, msg: "당신은 정말 행복해 보입니다." };
    } else if (x >= 0 && x <= 25 && y > 75 && y <= 100) {
      if (x == 25 && y == 100) {
        let find1and2 = await this.musicRepository.find1and2();
        const data = await cloudfront(find1and2);
        return { data, msg: "당신은 정말 화가 나 보입니다." };
      }
      let one = await this.musicRepository.findOneByStatus1();
      const data = await cloudfront(one);
      return { data, msg: "당신은 엄청난 분노를 느끼고 계시네요." };
    } else if (x > 25 && x <= 50 && y > 75 && y <= 100) {
      if (x == 50 && y == 100) {
        let find2and3 = await this.musicRepository.find2and3();
        const data = await cloudfront(find2and3);
        return { data, msg: "당신은 상당히 화가 난 것 같아요." };
      }
      let two = await this.musicRepository.findOneByStatus2();
      const data = await cloudfront(two);
      return { data, msg: "당신은 굉장히 화가 나 보입니다." };
    } else if (x > 50 && x <= 75 && y > 75 && y <= 100) {
      if (x == 75 && y == 100) {
        let find3and4 = await this.musicRepository.find3and4();
        const data = await cloudfront(find3and4);
        return { data, msg: "당신은 정말 행복해 보입니다." };
      }
      let three = await this.musicRepository.findOneByStatus3();
      const data = await cloudfront(three);
      return { data, msg: "당신은 굉장히 기뻐하는 것 같아요." };
    } else if (x > 75 && x <= 100 && y > 75 && y <= 100) {
      let four = await this.musicRepository.findOneByStatus4();
      const data = await cloudfront(four);
      return { data, msg: "당신은 기쁨을 느끼고 계시네요!" };
    }
  };
  findByKeyword = async ({ keyword }) => {
    const music = await this.musicRepository.findByKeyword({ keyword });
    if (keyword.length === 0) {
      throw new makeError({
        message: "해당하는 keyword가 없습니다.",
        code: 400,
      });
    }
    if (music.composerSong.length === 0 && music.musicTitle.length === 0) {
      return { message: "해당하는 keyword가 없습니다." };
    }
    return music;
  };

  likeChart = async (userId) => {
    const cacheKey = "likeChart";
  
    const cachedResult = await this.musicRepository.getChartData(cacheKey);
  
    if (cachedResult) {
      // 캐시에 데이터가 있으면 반환 전에 likeStatus를 업데이트
      await Promise.all(
        cachedResult.map(async (item) => {
          const Like = await this.likeRepository.findLike(userId, item.musicId);
          item.likeStatus = !!Like;
        })
      );
      return cachedResult;
    } else {
      const likeChart = await this.musicRepository.likeChart();
  
    await Promise.all(
      likeChart.map(async (item) => {
        const Like = await this.likeRepository.findLike(userId, item.musicId);
        item.dataValues.likeStatus = !!Like;
      })
    );
  
    const processedLikeChart = cloudfrontfor(likeChart);
    await this.musicRepository.setCache(processedLikeChart, cacheKey);
  
    return processedLikeChart;
    }
  };

  updateLikeStatus = async (chart, userId) => {
    await Promise.all(
      chart.map(async (item) => {
        const Like = await this.likeRepository.findLike(userId, item.musicId);
        item.dataValues.likeStatus = !!Like;
      })
    );
  };

  streamingChart = async () => {
    const streamingChart = await this.musicRepository.streamingChart();
    return cloudfrontfor(streamingChart);
  };

  sendStreaming = async (userId, musicId) => {
    const makeStreaming = await this.musicRepository.sendStreaming(
      userId,
      musicId
    );
    if (!makeStreaming) {
      throw makeError({
        message: "스트리밍을 생성하지 못했습니다.",
        code: 400,
      });
    }
    return;
  };
}
module.exports = MusicService;
