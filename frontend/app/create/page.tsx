"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import PostEditor from "../../components/editor/PostEditor";
import { useDraft } from "../../hooks/useDraft";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";

type Community = { id: string; name: string; description: string };

type Draft = {
  communityId: string;
  title: string;
  body: string;
  topics: string[];
};

const EMPTY_DRAFT: Draft = { communityId: "", title: "", body: "", topics: [] };

export default function CreatePostPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { value: draft, setValue: setDraft, restored, dismissRestored, clearDraft } = useDraft<Draft>(
    "thoughtdom:draft:new-post",
    EMPTY_DRAFT
  );

  const isDirty = !submitted && (draft.title.trim() !== "" || draft.body.trim() !== "");
  useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    api.listCommunities().then((cs) => {
      setCommunities(cs);
      setDraft((d) => (d.communityId ? d : { ...d, communityId: cs[0]?.id || "" }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const post = await api.createPost({
        community_id: draft.communityId,
        title: draft.title,
        body: draft.body,
        topics: draft.topics.join(", ") || undefined,
      });
      setSubmitted(true);
      clearDraft();
      router.push(`/post/${post.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Post an idea</h1>
        {restored && (
          <button
            onClick={() => {
              dismissRestored();
            }}
            className="text-xs text-muted hover:text-text rounded-full bg-surface2 px-3 py-1 transition-colors animate-fade-in-up"
          >
            Draft restored &mdash; dismiss
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="create-community" className="text-sm text-muted block mb-1">
              Community
            </label>
            <select
              id="create-community"
              value={draft.communityId}
              onChange={(e) => setDraft((d) => ({ ...d, communityId: e.target.value }))}
              className="w-full rounded-lg bg-surface2 border border-line px-3 py-2 text-sm outline-none focus:border-signal"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="create-title" className="text-sm text-muted block mb-1">
            Title
          </label>
          <input
            id="create-title"
            required
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className="w-full rounded-lg bg-surface2 border border-line px-3 py-2 text-sm outline-none focus:border-signal"
          />
        </div>

        <div>
          {/* Not a <label>: it heads a composite editor (textarea + toolbar +
              topics), not one form control, so there's nothing single to
              associate it with via htmlFor. */}
          <p className="text-sm text-muted mb-1">Your idea</p>
          <PostEditor
            body={draft.body}
            onBodyChange={(body) => setDraft((d) => ({ ...d, body }))}
            topics={draft.topics}
            onTopicsChange={(topics) => setDraft((d) => ({ ...d, topics }))}
          />
          <p className="text-xs text-muted/70 mt-1.5">
            Topics power your profile&apos;s Curiosity Map &mdash; tag what this idea is actually about.
          </p>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          disabled={loading || !draft.body.trim() || !draft.title.trim()}
          className="rounded-lg bg-signal text-ink font-medium py-2 text-sm disabled:opacity-50 transition-transform hover:enabled:scale-[1.01]"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}
