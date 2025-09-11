import {
  login,
  logout,
} from "@/controllers/auth";
import { validateAuth } from "@/middleware/validateAuth";
import express from "express";

const router = express.Router();

router.post("/login", validateAuth, login);
router.post("/logout", logout);

export default router;
