import { useEffect, useState } from "react";
import { CommunityFeed } from "@/components/community/community-feed";
import { communityApi } from "@/services/api";
import { useAppAuth } from "@/context/auth-context";

export function CommunityPage() {
  const { getToken } = useAppAuth();
  const [posts, setPosts] = useState([]);

  const loadPosts = async () => {
    const response = await communityApi.list();
    setPosts(response.posts);
  };

  const handleCreated = async (post) => {
    if (post) {
      setPosts((currentPosts) => [post, ...currentPosts.filter((currentPost) => currentPost.id !== post.id)]);
      return;
    }

    await loadPosts();
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">Community</p>
        <h2 className="page-title mt-2">Farmer reviews, shared outcomes, and field-tested tips</h2>
      </div>
      <CommunityFeed posts={posts} getToken={getToken} onCreated={handleCreated} />
    </div>
  );
}
