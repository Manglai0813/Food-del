import express, { Router } from "express";
import multer from "multer";
import {
  addFood,
  listFood,
  getFood,
  removeFood,
  updateFood,
} from "../controllers/foodController";
import { isAdmin } from "../middleware/authMiddleware";

const foodRouter: Router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

foodRouter.post("/", isAdmin, upload.single("image"), addFood);
foodRouter.put("/:id", isAdmin, upload.single("image"), updateFood);
foodRouter.delete("/:id", isAdmin, removeFood);
foodRouter.get("/", listFood);
foodRouter.get("/:id", getFood);

export default foodRouter;
