import Joi from "joi";
import User from "../../models/user";
import CustomeErrorHandler from "../../services/CustomeErrorHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";
import RefreshToken from "../../models/refreshToken";

const registerController = {
  async register(req, res, next) {
    //validation
    const registerSchema = Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(3).required(),
      repeat_password: Joi.ref("password"),
    });

    const { error } = registerSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    //check if user in already database
    const { name, email, password } = req.body;
    try {
      const exist = await User.exists({ email });
      if (exist) {
        return next(CustomeErrorHandler.alreadyExist("email already exist"));
      }
    } catch (err) {
      return next(err);
    }

    // hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // prepare model
    const user = new User({
      name,
      email,
      password: hashPassword,
    });

    let access_token;
    let refresh_token;
    try {
      const result = await user.save();

      // Token
      access_token = JwtService.sign({
        _id: result._id,
        private: result.private,
      });
      refresh_token = JwtService.sign(
        {
          _id: result._id,
          private: result.private,
        },
        "1y",
        REFRESH_SECRET
      );

      // database whitelist
      await RefreshToken.create({ token: refresh_token });
    } catch (err) {
      return next(err);
    }
    res.json({ access_token, refresh_token });
  },
};

export default registerController;
