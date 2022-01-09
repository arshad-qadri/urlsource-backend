import express from "express";
import {
  registerController,
  loginController,
  userController,
  refreshController,
  urlController,
} from "../controllers";
import auth from "../middlewares/auth";
const router = express.Router();

router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.post("/me", auth, userController.me);
router.post("/refresh", refreshController.refresh);
router.post("/logout", auth, loginController.logout);
router.post("/create-url", auth, urlController.createUrl);
router.post("/update-url/:_id", auth, urlController.updateUrl);
router.post("/delete-url/:_id", auth, urlController.deleteUrl);
router.get("/urlSources", auth, urlController.findAll);

export default router;
