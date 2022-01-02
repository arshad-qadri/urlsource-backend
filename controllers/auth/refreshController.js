import Joi from "joi";
import { REFRESH_SECRET } from "../../config";
import RefreshToken from "../../models/refreshToken";
import User from "../../models/user";
import CustomeErrorHandler from "../../services/CustomeErrorHandler";
import JwtService from "../../services/JwtService";

const refreshController = {
  async refresh(req, res, next) {
    //validation
    const refreshScema = Joi.object({
      refreshTokens: Joi.string().required(),
    });

    const { error } = refreshScema.validate(req.body);
    if (error) {
      return next(error);
    }
    // databse
    let refreshToken;
    try {
      refreshToken = await RefreshToken.findOne({
        token: req.body.refreshTokens,
      });
      console.log("refreshToken", refreshToken);
      if (!refreshToken) {
        return next(CustomeErrorHandler.unAuthorized("Invalid refresh token"));
      }
      let userId;
      try {
        const token_data = await JwtService.verify(
          refreshToken.token,
          REFRESH_SECRET
        );
        userId = token_data._id;
      } catch (err) {
        return next(CustomeErrorHandler.unAuthorized("Invalid refresh token"));
      }

      const user = await User.findOne({ _id: userId });
      if (!user) {
        return next(CustomeErrorHandler.unAuthorized("User not found"));
      }
      // Token
      const access_token = JwtService.sign({
        _id: user._id,
        private: user.private,
      });
      const refresh_token = JwtService.sign(
        {
          _id: user._id,
          private: user.private,
        },
        "1y",
        REFRESH_SECRET
      );

      // database whitelist
      await RefreshToken.create({ token: refresh_token });
      res.json({ access_token, refresh_token });
    } catch (err) {
      return next(new Error("Somthing went wrong" + err.message));
    }
  },
};

export default refreshController;
