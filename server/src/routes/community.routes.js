import express from "express";
import {
	createComment,
	createPost,
	getCommunityPosts,
	toggleLike
} from "../controllers/community.controller.js";
import { requireUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/posts", getCommunityPosts);
router.post("/posts", requireUser, createPost);
router.post("/posts/:id/comments", requireUser, createComment);
router.post("/posts/:id/like", requireUser, toggleLike);

export default router;
