import express from "express";
import {
  userSignup,
  userLogin,
  logout,
  getUser,
} from "../controller/user.js";
import {authentication} from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.get("/logout", logout);
router.get("/user", authentication, getUser);

export default router;
