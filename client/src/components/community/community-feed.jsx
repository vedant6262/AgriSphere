import { useState } from "react";
import { Heart, MessageSquareText } from "lucide-react";
import { communityApi } from "@/services/api";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

const META_MARKER = "[[AGRI_REVIEW_META]]";

const featuredReviews = [
  {
    id: "featured-1",
    authorName: "Rakesh Patil",
    title: "Drip irrigation reduced my input cost this season",
    content:
      "Shifted to scheduled drip cycles with mulch and saw lower water usage plus better onion quality at harvest.",
    createdAt: "2026-03-20T07:45:00.000Z",
    comments: [],
    meta: { rating: 5, crop: "Onion", location: "Nashik", reviewType: "TIP", recommended: true },
    isFeatured: true
  },
  {
    id: "featured-2",
    authorName: "Asha Nair",
    title: "Pest scouting routine helped avoid major loss",
    content:
      "Weekly scouting and sticky traps gave early warning for leaf miner. Timely action protected my tomato blocks.",
    createdAt: "2026-03-19T10:10:00.000Z",
    comments: [],
    meta: { rating: 4, crop: "Tomato", location: "Pune", reviewType: "REVIEW", recommended: true },
    isFeatured: true
  },
  {
    id: "featured-3",
    authorName: "Meera Joshi",
    title: "Need advice on fertilizer split for maize",
    content:
      "Irrigation is stable but I am unsure about top-dressing timing in current weather. Looking for farmer suggestions.",
    createdAt: "2026-03-18T12:20:00.000Z",
    comments: [],
    meta: { rating: 4, crop: "Maize", location: "Nagpur", reviewType: "QUESTION", recommended: null },
    isFeatured: true
  }
];

const parsePostMeta = (post) => {
  const content = String(post.content || "");
  const markerIndex = content.lastIndexOf(META_MARKER);

  if (markerIndex === -1) {
    return {
      ...post,
      content,
      meta: null
    };
  }

  const userContent = content.slice(0, markerIndex).trim();
  const rawMeta = content.slice(markerIndex + META_MARKER.length).trim();

  try {
    return {
      ...post,
      content: userContent,
      meta: JSON.parse(rawMeta)
    };
  } catch {
    return {
      ...post,
      content,
      meta: null
    };
  }
};

const getReviewTypeLabel = (value) => {
  if (value === "TIP") return "Farmer Tip";
  if (value === "QUESTION") return "Question";
  return "Review";
};

const renderStars = (rating = 0) => "★".repeat(Math.max(0, Number(rating || 0))) + "☆".repeat(Math.max(0, 5 - Number(rating || 0)));

export function CommunityFeed({ posts = [], getToken, onCreated }) {
  const [form, setForm] = useState({
    authorName: "",
    title: "",
    content: "",
    crop: "",
    location: "",
    rating: 5,
    reviewType: "REVIEW",
    recommended: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [actionError, setActionError] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentAuthors, setCommentAuthors] = useState({});

  const parsedPosts = posts.map(parsePostMeta);
  const feedItems = [...parsedPosts, ...featuredReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const authorName = form.authorName.trim() || "Anonymous Farmer";
    const title = form.title.trim() || "Farmer Review";
    const content = form.content.trim() || "Shared a quick update from the farm today.";
    const crop = form.crop.trim();
    const location = form.location.trim();

    try {
      const payload = {
        authorName,
        title,
        content,
        rating: Number.isFinite(Number(form.rating)) ? Number(form.rating) : 5,
        reviewType: form.reviewType,
        recommended: Boolean(form.recommended)
      };

      if (crop) {
        payload.crop = crop;
      }

      if (location) {
        payload.location = location;
      }

      const response = await communityApi.create(payload, getToken);
      setForm({ authorName: "", title: "", content: "", crop: "", location: "", rating: 5, reviewType: "REVIEW", recommended: true });
      await onCreated(response.post);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || "Could not publish your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (post) => {
    if (post.isFeatured) {
      return;
    }

    setActionError("");

    try {
      await communityApi.toggleLike(post.id, getToken);
      await onCreated();
    } catch (error) {
      setActionError(error?.response?.data?.message || "Could not update the like right now.");
    }
  };

  const handleComment = async (post) => {
    if (post.isFeatured) {
      return;
    }

    const authorName = (commentAuthors[post.id] || "").trim() || "Anonymous Farmer";
    const content = (commentDrafts[post.id] || "").trim() || "Thanks for sharing.";

    setActionError("");

    try {
      await communityApi.createComment(post.id, { authorName, content }, getToken);
      setCommentDrafts((current) => ({ ...current, [post.id]: "" }));
      await onCreated();
    } catch (error) {
      setActionError(error?.response?.data?.message || "Could not post your comment right now.");
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <DashboardCard title="Add Farmer Review" description="Share your review, tip, or question so other farmers can learn from your experience.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input placeholder="Your name" value={form.authorName} onChange={(event) => setForm({ ...form, authorName: event.target.value })} />
            <Input placeholder="Post title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Crop (e.g. Wheat)" value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} />
              <Input placeholder="Location (e.g. Nashik)" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select
                className="h-11 rounded-2xl border border-border bg-background/70 px-4 text-sm"
                value={form.reviewType}
                onChange={(event) => setForm({ ...form, reviewType: event.target.value })}
              >
                <option value="REVIEW">Review</option>
                <option value="TIP">Tip</option>
                <option value="QUESTION">Question</option>
              </select>
              <Input placeholder="Rating (1-5)" type="number" min="1" max="5" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} />
              <select
                className="h-11 rounded-2xl border border-border bg-background/70 px-4 text-sm"
                value={String(form.recommended)}
                onChange={(event) => setForm({ ...form, recommended: event.target.value === "true" })}
              >
                <option value="true">Recommended</option>
                <option value="false">Not Recommended</option>
              </select>
            </div>
            <Textarea placeholder="Describe the issue or technique in detail." value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
            <Button className="w-full" disabled={isSubmitting} type="submit">
              Publish Review
            </Button>
            {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}
          </form>
      </DashboardCard>

      <div className="space-y-4">
        {feedItems.map((post) => (
          <DashboardCard key={post.id} className="p-4 sm:p-5">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-2xl font-semibold">{post.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {post.authorName} • {formatDate(post.createdAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">{getReviewTypeLabel(post.meta?.reviewType)}</Badge>
                    {post.meta?.crop ? <Badge variant="outline">Crop: {post.meta.crop}</Badge> : null}
                    {post.meta?.location ? <Badge variant="outline">{post.meta.location}</Badge> : null}
                    {post.isFeatured ? <Badge>Featured</Badge> : null}
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <MessageSquareText className="h-4 w-4" />
                  {post.comments?.length || 0} replies
                </div>
              </div>
              {post.meta?.rating ? (
                <p className="text-sm font-semibold tracking-wide text-amber-500">{renderStars(post.meta.rating)} ({post.meta.rating}/5)</p>
              ) : null}
              <p className="text-sm leading-7">{post.content}</p>
              {typeof post.meta?.recommended === "boolean" ? (
                <p className={`text-sm font-medium ${post.meta.recommended ? "text-emerald-600" : "text-rose-600"}`}>
                  {post.meta.recommended ? "Recommended by farmer" : "Not recommended by farmer"}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleLike(post)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  <Heart className="h-3.5 w-3.5" />
                  {post.likedByMe ? "Liked" : "Like"} ({post.likesCount || 0})
                </button>
                <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  Comment
                </button>
              </div>
              {actionError ? <p className="text-sm text-rose-600">{actionError}</p> : null}

              {!post.isFeatured ? (
                <div className="grid gap-2 rounded-2xl border border-border bg-background/55 p-3 md:grid-cols-[0.28fr_1fr_auto]">
                  <Input
                    placeholder="Your name"
                    value={commentAuthors[post.id] || ""}
                    onChange={(event) =>
                      setCommentAuthors((current) => ({
                        ...current,
                        [post.id]: event.target.value
                      }))
                    }
                  />
                  <Input
                    placeholder="Add a comment"
                    value={commentDrafts[post.id] || ""}
                    onChange={(event) =>
                      setCommentDrafts((current) => ({
                        ...current,
                        [post.id]: event.target.value
                      }))
                    }
                  />
                  <Button type="button" variant="outline" onClick={() => handleComment(post)}>
                    Post
                  </Button>
                </div>
              ) : null}

              {post.comments?.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-border bg-background/60 p-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-primary/25 pl-4">
                      <p className="font-medium">{comment.authorName}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</p>
                      <p className="mt-2 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
