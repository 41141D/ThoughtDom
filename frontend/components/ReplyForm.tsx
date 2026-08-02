"use client";

import { useId, useState } from "react";
import { api } from "../lib/api";

type ReplyType = "neutral" | "agree" | "challenge";

export default function ReplyForm({
  postId,
  parentCommentId = null,
  autoFocus = false,
  compact = false,
  onPosted,
  onCancel,
}: {
  postId: string;
  parentCommentId?: string | null;
  autoFocus?: boolean;
  compact?: boolean;
  onPosted: () => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [replyType, setReplyType] = useState<ReplyType>("neutral");
  const [steelman, setSteelman] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const steelmanId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.createComment({
        post_id: postId,
        parent_comment_id: parentCommentId,
        reply_type: replyType,
        steelman_text: replyType === "challenge" ? steelman : undefined,
        body,
      });
      setBody("");
      setSteelman("");
      setReplyType("neutral");
      await onPosted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl2 border border-line bg-surface flex flex-col gap-3 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex gap-2">
        {(["neutral", "agree", "challenge"] as const).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setReplyType(t)}
            className={`reply-type-pill border transition-colors ${
              replyType === t ? "border-signal text-signal" : "border-line text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {replyType === "challenge" && (
        <div className="animate-fade-in-up">
          <label htmlFor={steelmanId} className="text-xs text-challenge block mb-1">
            First, restate the argument you&apos;re disagreeing with, fairly &mdash; this has to
            pass a fairness check before your challenge can post.
          </label>
          <textarea
            id={steelmanId}
            required
            rows={2}
            value={steelman}
            onChange={(e) => setSteelman(e.target.value)}
            placeholder="What are they actually claiming?"
            className="w-full rounded-lg bg-surface2 border border-line px-3 py-2 text-sm outline-none focus:border-challenge transition-colors"
          />
        </div>
      )}

      <textarea
        required
        autoFocus={autoFocus}
        rows={compact ? 2 : 3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          replyType === "challenge"
            ? "Now your response... (markdown: **bold**, *italic*, `code`, [links](url))"
            : "Your reply... (markdown: **bold**, *italic*, `code`, [links](url))"
        }
        className="w-full rounded-lg bg-surface2 border border-line px-3 py-2 text-sm outline-none focus:border-signal transition-colors resize-none"
      />

      {error && <p className="text-danger text-sm">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          disabled={loading}
          className="self-start rounded-lg bg-signal text-ink font-medium px-4 py-2 text-sm disabled:opacity-50 transition-transform hover:enabled:scale-[1.02]"
        >
          {loading ? "Posting..." : "Reply"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-muted hover:text-text text-sm px-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
