"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSession, getUsername } from "../lib/api";

export default function NavBar() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getUsername());
  }, []);

  return (
    <header className="border-b border-line sticky top-0 bg-ink/95 backdrop-blur z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display font-semibold text-lg tracking-tight text-text">
          Thought<span className="text-signal">Dom</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/why" className="text-muted hover:text-text">
            Why
          </Link>
          {username ? (
            <>
              <Link href={`/u/${username}`} className="text-muted hover:text-text">
                {username}
              </Link>
              <Link href="/create" className="text-signal font-medium">
                New post
              </Link>
              <button
                onClick={() => {
                  clearSession();
                  window.location.href = "/";
                }}
                className="text-muted hover:text-danger"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-text">
                Sign in
              </Link>
              <Link href="/register" className="text-signal font-medium">
                Get a name
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
