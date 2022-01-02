import CustomeErrorHandler from "../services/CustomeErrorHandler";
import JwtService from "../services/JwtService";

const auth = async (req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(CustomeErrorHandler.unAuthorized());
  }

  const token = authHeader.split(" ")[1];

  try {
    const token_data = await JwtService.verify(token);
    const user = {
      _id: token_data._id,
      private: token_data.private,
    };
    req.user = user;
    next();
  } catch (err) {
    return next(CustomeErrorHandler.unAuthorized());
  }
};

export default auth;
