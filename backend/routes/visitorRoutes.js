import express from "express";
import {
  createVisitor,
  getVisitors,
  getVisitor,
  updateVisitor,
  deleteVisitor,
  getTodayVisitors,
  exportVisitors
} from "../controllers/visitorController.js";

const router = express.Router();

router.get("/today", getTodayVisitors);
router.get("/export", exportVisitors);
router.get("/", getVisitors);
router.get("/:id", getVisitor);
router.post("/", createVisitor);
router.put("/:id", updateVisitor);
router.delete("/:id", deleteVisitor);

export default router;
