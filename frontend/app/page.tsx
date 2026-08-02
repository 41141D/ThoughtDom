"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PostCardSkeleton from "../components/PostCardSkeleton";

type Post = {
  id: string;
  author_username: string;
  title: string;
  body: string;
  score: number;
  created_at: string;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listPosts()
      .then(setPosts)
      .catch((e) => setError(e.message));
  }, []);

  const loading = posts === null && !error;

  return (
    <div>
      <Hero />

      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-semibold">Latest ideas</h1>
        <p className="text-muted text-xs">Ranked by quality, not who posted them.</p>
      </div>

      {error && (
        <div className="rounded-xl2 border border-danger/30 bg-danger/10 p-4 text-sm text-danger mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading posts">
          {Array.from({ length: 4 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {posts && posts.length === 0 && !error && <EmptyFeed />}

      {posts && posts.length > 0 && (
        <div className="flex flex-col gap-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} delay={i * 45} />
          ))}
        </div>
      )}
    </div>
  );
}

function Hero() {
  return (
    <div className="hero-glow rounded-xl2 border border-line p-5 mb-8 relative overflow-hidden">
      <div className="reply-type-pill inline-block bg-challenge/15 text-challenge mb-3">
        Steel-Man Gate
      </div>
      <h2 className="font-display text-xl font-semibold leading-snug mb-1.5">
        Disagree all you want. Just prove you understood first.
      </h2>
      <p className="text-sm text-muted max-w-md leading-relaxed">
        Before a challenge reply can post here, you have to restate the argument
        fairly &mdash; in the words its author would recognize. No names attached,
        no straw men allowed.
      </p>
    </div>
  );
}

function PostCard({ post, delay }: { post: Post; delay: number }) {
  return (
    <Link
      href={`/post/${post.id}`}
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fade-in-up group block rounded-xl2 border border-line bg-surface p-4 transition-all duration-200 hover:border-signal/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-signal/5"
    >
      <div className="flex items-center gap-2 text-xs text-muted mb-1.5">
        <span>{post.author_username}</span>
        <span>&middot;</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      <h2 className="font-display font-semibold text-lg leading-snug text-text group-hover:text-signal transition-colors">
        {post.title}
      </h2>
      <p className="text-sm text-muted mt-1.5 line-clamp-2 leading-relaxed">{post.body}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-signal font-medium">{post.score} pts</div>
        <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
          Read &rarr;
        </span>
      </div>
    </Link>
  );
}

function EmptyFeed() {
  return (
    <div className="animate-fade-in-up rounded-xl2 border border-dashed border-line bg-surface/50 p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-signal/10 text-signal">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </div>
      <h3 className="font-display font-semibold text-text mb-1">Nothing here yet</h3>
      <p className="text-sm text-muted mb-5 max-w-xs mx-auto leading-relaxed">
        Be the first name-that-isn&apos;t-a-name to post an idea worth challenging.
      </p>
      <Link
        href="/create"
        className="inline-flex items-center rounded-lg bg-signal text-ink font-medium px-4 py-2 text-sm transition-transform hover:scale-[1.03]"
      >
        Post the first idea
      </Link>
    </div>
  );
}
