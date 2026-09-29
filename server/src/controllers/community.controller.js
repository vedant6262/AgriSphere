import { z } from "zod";
import {
  createCommunityComment,
  createCommunityPost,
  listCommunityPosts,
  toggleCommunityPostLike
} from "../services/community.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const createPostSchema = z.object({
  authorName: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  crop: z.string().min(2).max(50).optional(),
  location: z.string().min(2).max(80).optional(),
  reviewType: z.enum(["REVIEW", "TIP", "QUESTION"]).optional(),
  recommended: z.boolean().optional()
});

const createCommentSchema = z.object({
  authorName: z.string().optional(),
  content: z.string().optional()
});

export const getCommunityPosts = asyncHandler(async (req, res) => {
  const posts = await listCommunityPosts(req.userId || null);
  res.json({ posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const parsed = createPostSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid community post payload.",
      details: parsed.error.flatten()
    });
  }

  const { content, rating, crop, location, reviewType, recommended, ...base } = parsed.data;
  const normalizedBase = {
    authorName: (base.authorName || "Anonymous Farmer").trim() || "Anonymous Farmer",
    title: (base.title || "Farmer Review").trim() || "Farmer Review",
    content: (content || "Shared a quick update from the farm today.").trim() || "Shared a quick update from the farm today."
  };
  const normalizedContent = normalizedBase.content;
  const hasMeta =
    rating != null ||
    Boolean(crop) ||
    Boolean(location) ||
    Boolean(reviewType) ||
    typeof recommended === "boolean";

  const reviewMeta = hasMeta
    ? {
        rating: rating ?? null,
        crop: crop || null,
        location: location || null,
        reviewType: reviewType || null,
        recommended: typeof recommended === "boolean" ? recommended : null
      }
    : null;

  const payload = {
    ...normalizedBase,
    content: reviewMeta ? `${normalizedContent}\n\n[[AGRI_REVIEW_META]]${JSON.stringify(reviewMeta)}` : normalizedContent
  };

  const post = await createCommunityPost(req.userId, payload);
  res.status(201).json({ post });
});

export const createComment = asyncHandler(async (req, res) => {
  const parsed = createCommentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid comment payload.",
      details: parsed.error.flatten()
    });
  }

  const commentPayload = {
    authorName: (parsed.data.authorName || "Anonymous Farmer").trim() || "Anonymous Farmer",
    content: (parsed.data.content || "Thanks for sharing.").trim() || "Thanks for sharing."
  };

  const comment = await createCommunityComment(req.userId, req.params.id, commentPayload);
  res.status(201).json({ comment });
});

export const toggleLike = asyncHandler(async (req, res) => {
  const result = await toggleCommunityPostLike(req.userId, req.params.id);
  res.json(result);
});
