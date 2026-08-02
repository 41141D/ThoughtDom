"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import VoteButtons from "../../../components/VoteButtons";
import ReplyForm from "../../../components/ReplyForm";
import CommentThread, { Comment } from "../../../components/CommentThread";
import { renderMarkdown } from "../../../lib/markdown";

type Post = {
  id: string;
  author_username: string;
  title: string;
  body: string;
  score: number;
  my_vote: number | null;
  created_at: string;
};

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    const [p, c] = await Promise.all([api.getPost(params.id), api.listComments(params.id)]);
    setPost(p);
    setComments(c);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, [params.id]);

  if (error) {
    return (
      <div className="rounded-xl2 border border-danger/30 bg-danger/10 p-4 text-sm text-danger">{error}</div>
    );
  }

  if (!post || comments === null) {
    return <PostDetailSkeleton />;
  }

  return (
    <div>
      <div className="rounded-xl2 border border-line bg-surface p-5 mb-6 animate-fade-in-up">
        <div className="flex items-center gap-2 text-xs text-muted mb-2">
          <Link href={`/u/${post.author_username}`} className="hover:text-signal transition-colors">
            {post.author_username}
          </Link>
          <span>&middot;</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <h1 className="font-display text-2xl font-semibold leading-snug">{post.title}</h1>
        <div className="text-sm text-text/90 mt-3">{renderMarkdown(post.body)}</div>
        <div className="mt-4 flex items-center gap-3">
          <VoteButtons targetType="post" targetId={post.id} score={post.score} myVote={post.my_vote} />
        </div>
      </div>

      <h2 className="font-display text-lg font-semibold mb-3">
        {comments.length} {comments.length === 1 ? "reply" : "replies"}
      </h2>

      <div className="mb-6">
        <CommentThread postId={post.id} comments={comments} onChanged={refresh} />
      </div>

      <ReplyForm postId={post.id} onPosted={refresh} />
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div>
      <div className="rounded-xl2 border border-line bg-surface p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-3 rounded-full" />
          <div className="skeleton h-3 w-14 rounded" />
        </div>
        <div className="skeleton h-7 w-3/4 rounded mb-3" />
        <div className="skeleton h-4 w-full rounded mb-1.5" />
        <div className="skeleton h-4 w-full rounded mb-1.5" />
        <div className="skeleton h-4 w-2/3 rounded mb-4" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
      <div className="skeleton h-5 w-24 rounded mb-3" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl2 border border-line bg-surface p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-3 w-14 rounded" />
            </div>
            <div className="skeleton h-3.5 w-full rounded mb-1.5" />
            <div className="skeleton h-3.5 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
