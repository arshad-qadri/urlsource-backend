import Joi from "joi";
import User from "../../models/user";
import CustomeErrorHandler from "../../services/CustomeErrorHandler";
import bcrypt from "bcrypt";
import JwtService from "../../services/JwtService";
import RefreshToken from "../../models/refreshToken";
import { REFRESH_SECRET } from "../../config";

const loginController = {
  async login(req, res, next) {
    //validation
    const loginScema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error } = loginScema.validate(req.body);
    if (error) {
      return next(error);
    }

    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return next(CustomeErrorHandler.wrongCredentials());
      }

      // compare password
      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) {
        return next(CustomeErrorHandler.wrongCredentials());
      }

      //token
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
      return next(err);
    }
  },

  async logout(req, res, next) {
    try {
      // validation
      const refreshSchema = Joi.object({
        refresh_token: Joi.string().required(),
      });
      const { error } = refreshSchema.validate(req.body);

      if (error) {
        return next(error);
      }
      await RefreshToken.deleteOne({ token: req.body.refresh_token });
    } catch (err) {
      return next(new Error("Somthing went wrong in database"));
    }
    res.json({ status: 1 });
  },
};
export default loginController;
