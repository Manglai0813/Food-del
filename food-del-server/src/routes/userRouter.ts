import express, { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
} from "../controllers/userController";

const userRouter: Router = express.Router();

userRouter.post("/auth/register", registerUser);
userRouter.post("/auth/login", loginUser);
userRouter.post("/auth/logout", logoutUser);

export default userRouter;
