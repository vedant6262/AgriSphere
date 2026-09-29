import { getPrisma } from "../lib/prisma.js";
import { fallbackCommunityPosts } from "../utils/fallback-data.js";
import { getFarmSettings } from "./settings.service.js";

const postLikes = new Map();
const demoCommunityPosts = [];

const isDemoPostId = (postId) => String(postId || "").startsWith("demo-");

const findDemoCommunityPost = (postId) => demoCommunityPosts.find((post) => post.id === postId);

const createDemoCommunityPost = (data) => {
  const post = {
    id: `demo-${Date.now()}`,
    authorName: data.authorName,
    title: data.title,
    content: data.content,
    createdAt: new Date().toISOString(),
    comments: [],
    likesCount: 0,
    likedByMe: false
  };

  demoCommunityPosts.unshift(post);
  return post;
};

const createDemoCommunityComment = (postId, data) => {
  const post = findDemoCommunityPost(postId);

  if (!post) {
    return null;
  }

  const comment = {
    id: `demo-comment-${Date.now()}`,
    postId,
    authorName: data.authorName,
    content: data.content,
    createdAt: new Date().toISOString()
  };

  post.comments = [...(post.comments || []), comment];
  return comment;
};

const getLikeSet = (postId) => {
  if (!postLikes.has(postId)) {
    postLikes.set(postId, new Set());
  }

  return postLikes.get(postId);
};

const enrichPost = (post, clerkUserId) => {
  const likeSet = getLikeSet(post.id);

  return {
    ...post,
    likesCount: likeSet.size,
    likedByMe: clerkUserId ? likeSet.has(clerkUserId) : false
  };
};

export const listCommunityPosts = async (clerkUserId = null) => {
  const prisma = await getPrisma();

  if (!prisma) {
    return [...demoCommunityPosts, ...fallbackCommunityPosts].map((post) => enrichPost(post, clerkUserId));
  }

  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      comments: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  return [...demoCommunityPosts, ...posts].map((post) => enrichPost(post, clerkUserId));
};

export const createCommunityPost = async (clerkUserId, data) => {
  const prisma = await getPrisma();

  if (!prisma) {
    return createDemoCommunityPost(data);
  }

  const profile = await getFarmSettings(clerkUserId);

  if (profile.id === "demo-settings") {
    return createDemoCommunityPost(data);
  }

  try {
    const post = await prisma.communityPost.create({
      data: {
        farmProfileId: profile.id,
        authorName: data.authorName,
        title: data.title,
        content: data.content
      },
      include: {
        comments: true
      }
    });

    return enrichPost(post, clerkUserId);
  } catch (error) {
    console.warn("[community] prisma error, using in-memory post", error.message);
    return createDemoCommunityPost(data);
  }
};

export const createCommunityComment = async (clerkUserId, postId, data) => {
  const prisma = await getPrisma();

  if (!prisma || isDemoPostId(postId)) {
    const demoComment = createDemoCommunityComment(postId, data);

    if (demoComment) {
      return demoComment;
    }

    return {
      id: `demo-comment-${Date.now()}`,
      postId,
      authorName: data.authorName,
      content: data.content,
      createdAt: new Date().toISOString()
    };
  }

  await getFarmSettings(clerkUserId);

  try {
    return await prisma.communityComment.create({
      data: {
        postId,
        authorName: data.authorName,
        content: data.content
      }
    });
  } catch (error) {
    console.warn("[community] create comment failed, using in-memory comment", error.message);
    const demoComment = createDemoCommunityComment(postId, data);

    if (demoComment) {
      return demoComment;
    }

    return {
      id: `demo-comment-${Date.now()}`,
      postId,
      authorName: data.authorName,
      content: data.content,
      createdAt: new Date().toISOString()
    };
  }
};

export const toggleCommunityPostLike = async (clerkUserId, postId) => {
  const prisma = await getPrisma();

  if (!prisma || isDemoPostId(postId)) {
    const likeSet = getLikeSet(postId);

    if (likeSet.has(clerkUserId)) {
      likeSet.delete(clerkUserId);
    } else {
      likeSet.add(clerkUserId);
    }

    return {
      postId,
      likesCount: likeSet.size,
      likedByMe: likeSet.has(clerkUserId)
    };
  }

  try {
    await prisma.communityPost.findUniqueOrThrow({ where: { id: postId } });
  } catch (error) {
    const likeSet = getLikeSet(postId);

    if (likeSet.has(clerkUserId)) {
      likeSet.delete(clerkUserId);
    } else {
      likeSet.add(clerkUserId);
    }

    return {
      postId,
      likesCount: likeSet.size,
      likedByMe: likeSet.has(clerkUserId)
    };
  }

  const likeSet = getLikeSet(postId);

  if (likeSet.has(clerkUserId)) {
    likeSet.delete(clerkUserId);
  } else {
    likeSet.add(clerkUserId);
  }

  return {
    postId,
    likesCount: likeSet.size,
    likedByMe: likeSet.has(clerkUserId)
  };
};
