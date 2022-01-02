import User from "../../models/user";
import CustomeErrorHandler from "../../services/CustomeErrorHandler";

const userController = {
  async me(req, res, next) {
    try {
      const user = await User.findOne({ _id: req.user._id }).select(
        "-password -__v"
      );
      if (!user) {
        return next(CustomeErrorHandler.notFound());
      }
      res.json(user);
    } catch (err) {
      return next(err);
    }
  },
};

export default userController;
