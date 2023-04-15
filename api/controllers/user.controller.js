const UserService = require("../services/user.service");
const jwt = require("jsonwebtoken");
const createTransporter = require("../../db/config/email");
const transporter = createTransporter();

class UserController {
  userService = new UserService();

  //회원가입
  signUp = async (req, res, next) => {
    const { id, password, confirm, email, nickname } = req.body;
    try {
      const user = await this.userService.signUp(
        id,
        password,
        confirm,
        email,
        nickname
      );
      res.status(201).json({
        message: "회원가입을 성공하였습니다.",
        nickname: user.nickname,
      });
    } catch (error) {
      next(error);
    }
  };

  //로그인
  login = async (req, res, next) => {
    const { id, password } = req.body;
    try {
      const user = await this.userService.login(id, password);
      const { nickname, profileUrl, accessToken, refreshToken } = user;

      res.status(200).json({
        message: "로그인에 성공하였습니다.",
        accessToken,
        refreshToken,
        nickname,
        profileUrl,
      });
    } catch (error) {
      next(error);
    }
  };

  //회원가입 시 아이디 및 닉네임 확인
  check = async (req, res, next) => {
    const { id, nickname } = req.body;
    try {
      if (!nickname) {
        await this.userService.idCheck(id);
        res.status(200).json({ message: "사용가능한 아이디 입니다." });
      }
      if (!id) {
        await this.userService.nickNameCheck(nickname);
        res.status(200).json({ message: "사용가능한 닉네임 입니다." });
      }
    } catch (error) {
      next(error);
    }
  };

  //로그인 카카오
  kakaoLogin = async (req, res, next) => {
    try {
      const { code } = req.body;
      const authToken = await this.userService.getKakaoTokens(code);
      const userData = await this.userService.getUserInfo(authToken);
      const { access_token, refresh_token, nickname, profileUrl } =
        await this.userService.makeTokenAndUserInfo(userData);
      res.status(200).json({
        message: "카카오 로그인 성공",
        access_token: access_token,
        refresh_token: refresh_token,
        nickname,
        profileUrl,
      });
    } catch (error) {
      next(error);
    }
  };

  //유저 정보 조회
  userInfo = async (req, res, next) => {
    try {
      const { userId } = res.locals.user;
      const userInfo = await this.userService.userInfo(userId);
      res.status(200).json({
        message: "사용자 정보 조회를 성공했습니다.",
        userInfo,
      });
    } catch (error) {
      next(error);
    }
  };

  //유저 좋아요 조회
  likeList = async (req, res, next) => {
    try {
      const { userId } = res.locals.user;
      const { page } = req.query;
      const likeList = await this.userService.likeList(userId, page);
      res.status(200).json({
        message: "사용자가 좋아요한 음악조회를 성공했습니다.",
        likeCount: likeList.musicCount,
        likeList: likeList.musicList,
      });
    } catch (error) {
      next(error);
    }
  };

  //유저 스크랩 조회
  scrapList = async (req, res, next) => {
    try {
      const { userId } = res.locals.user;
      const { page } = req.query;
      const scrapList = await this.userService.scrapList(userId, page);
      res.status(200).json({
        message: "사용자가 스크랩한 음악조회를 성공했습니다.",
        scrapCount: scrapList.musicCount,
        scrapList: scrapList.musicList,
      });
    } catch (error) {
      next(error);
    }
  };

  //유저 플레이리스트 조회
  myList = async (req, res, next) => {
    try {
      const { userId } = res.locals.user;
      const myList = await this.userService.myList(userId);
      res.status(200).json({
        message: "사용자가 스크랩한 음악조회를 성공했습니다.",
        myList,
      });
    } catch (error) {
      next(error);
    }
  };

  //리뷰 조회
  reviewList = async (req, res, next) => {
    try {
      const { userId } = res.locals.user;
      const { page } = req.query;
      const data = await this.userService.reviewList(userId, page);
      res.status(200).json({
        message: "리뷰 조회 성공",
        reviewCount: data.count,
        reviewList: data.data,
      });
    } catch (error) {
      next(error);
    }
  };

  //프로필 변경
  uploadProfile = async (req, res, next) => {
    try {
      const { userId } = res.locals.user;
      const file = req.files[0];

      if (!file || req.files.length !== 1) {
        res
          .status(400)
          .json({ message: "프로필사진은 1장만 업로드 가능합니다." });
      }
      if (file.mimetype.includes("image") === false) {
        res
          .status(400)
          .json({ massage: "이미지 파일 형식만 업로드 가능합니다." });
      }
      if (file.size > 5 * 1024 * 1024) {
        res
          .status(400)
          .json({ message: "파일 크기는 5MB를 초과할 수 없습니다." });
      }
      const data = await this.userService.uploadImage(file);

      const fileName = "https://d13uh5mnneeyhq.cloudfront.net/" + data.Key;
      await this.userService.uploadProfile(userId, fileName);
      res.status(200).json({ message: "업로드성공" });
    } catch (error) {
      next(error);
    }
  };

  //회원 탈퇴
  deleteUser = async (req, res, next) => {
    try {
      const { userId } = res.locals.user;
      const { email } = req.body;
      await this.userService.deleteUser(userId, email);
      res.status(200).json({ message: "회원탈퇴에 성공하였습니다" });
    } catch (error) {
      next(error);
    }
  };

  //리프레쉬 토큰으로 엑세스 토큰 재발급
  refresh = async (req, res, next) => {
    const { authorization } = req.headers;
    const [tokenType, token] = (authorization ?? "").split(" ");

    if (tokenType !== "Bearer" || !token) {
      return res.status(401).json({
        message:
          "리프래시 토큰 타입이 일치하지 않거나, 토큰이 존재하지 않습니다.",
      });
    }

    try {
      const userId = await this.userService.findUserIdAndCheckUser(token);
      const newAccessToken = await this.userService.makeNewAccessToken(userId);

      return res.status(200).json({
        message: "새로운 토큰이 발급되었습니다,",
        accessToken: newAccessToken,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res
          .status(401)
          .json({ message: "리프레시 토큰이 만료되었습니다." });
      } else {
        return res
          .status(401)
          .json({ message: "유효하지 않은 리프레시 토큰입니다." });
      }
    }
  };

  //유저 닉네임 변경
  changeNickname = async (req, res, next) => {
    try {
      const { userId } = res.locals.user;
      const { nickname } = req.body;

      await this.userService.changeNickname(userId, nickname);
      res.status(200).json({ message: "닉네임 변경이 완료되었습니다." });
    } catch (error) {
      next(error);
    }
  };

  //유저 인증 이메일 발송
  mailSavePassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const password = Math.floor(Math.random() * 1000000); // 6자리 랜덤한 비밀번호 생성
      await this.userService.savePassword({ email, password });
      let mailOptions = {
        from: "MoodClassic99@gmail.com", //송신할 이메일
        to: email, //수신할 이메일
        subject: "MOOD 확인 코드입니다.",
        html: `
         <div>
             <h2>Mood Code</h2>
             <div class="phone" style="font-size: 1.1em;"> "코드를 Mood 홈페이지에 입력하세요."</div>
             <div class="message" style="font-size: 1.1em;">message : ${password}</div>
         </div>
         `,
      };
      await transporter.sendMail(mailOptions);
      return res.json({ message: "이메일 전송 완료" }); // 비밀번호를 res에 담아 보내줍니다.
    } catch (err) {
      next(err);
    }
  };

  //유저 인증 이메일 검사
  mailCheck = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const check = await this.userService.mailCheck({ email, password });
      return res.json({ check });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = UserController;
