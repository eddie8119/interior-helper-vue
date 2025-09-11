// import {
//   createProject,
//   deleteProject,
//   getProject,
//   getProjects,
// } from "@/controllers/project";
import { authMiddleware } from "@/middleware/auth";
import express from "express";

const router = express.Router();

router.use(authMiddleware);

// router.get("/projects", getProjects);
// router.get("/projects/:id", getProject);
// router.post("/projects", createProject);
// router.patch("/projects/:id", updateProject);
// router.delete("/projects/:id", deleteProject);

export default router;
