import {
  createProject,
  getProject,
  getProjects,
  updateProject,
  deleteProject,
} from "@/controllers/project";
import { authMiddleware, requireUserId } from "@/middleware/auth";
import express from "express";

const router = express.Router();

router.use(authMiddleware);

router.get("/", requireUserId, getProjects);
router.get("/:id", requireUserId, getProject);
router.post("/", requireUserId, createProject);
router.patch("/:id", requireUserId, updateProject);
router.delete("/:id", requireUserId, deleteProject);

export default router;
