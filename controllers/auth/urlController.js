import Joi from "joi";
import errorHandler from "../../middlewares/errorHandler";
import UrlSource from "../../models/urlSource";
import CustomeErrorHandler from "../../services/CustomeErrorHandler";
import JwtService from "../../services/JwtService";

const urlController = {
  async createUrl(req, res, next) {
    const createSchema = Joi.object({
      title: Joi.string().required(),
      url: Joi.string().required(),
    });

    const { error } = createSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const token = req.headers.authorization.replace("Bearer ", "");
    console.log("token", token.replace("Bearer ", ""));
    const token_data = await JwtService.decode(token);
    const urlSource = new UrlSource({
      userId: token_data._id,
      title: req.body.title,
      url: req.body.url,
    });
    try {
      await urlSource.save();
      res.json("Created successfully.");
    } catch (err) {
      next(err);
    }
  },

  async updateUrl(req, res, next) {
    const updateSchema = Joi.object({
      title: Joi.string().required(),
      url: Joi.string().required(),
    });

    const { error } = updateSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const id = req.params._id;
    const { title, url } = req.body;
    UrlSource.updateOne(
      { _id: id },
      { title: title, url: url },
      { useFindAndModify: false }
    )
      .then(data => {
        res.send("Updated successfully");
      })
      .catch(err => {
        next(err);
      });
  },

  async deleteUrl(req, res, next) {
    const _id = req.params._id;
    await UrlSource.deleteOne({ _id: _id })
      .then(data => {
        if (!data) {
          next(CustomeErrorHandler.notFound());
        } else {
          res.send("Deleted successfully");
        }
      })
      .catch(err => {
        next(err);
      });
  },

  async findAll(req, res, next) {
    await UrlSource.find()
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        next(CustomeErrorHandler.notFound());
      });
  },
};
export default urlController;
