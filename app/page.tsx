"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Snippet = {
  id: string;
  title: string;
  language: string;
  code: string;
  tags: string[];
  created_at: string;
};

type ConnectionStatus = "connecting" | "connected" | "disconnected";

const LANGUAGES = [
  { name: "TypeScript", dot: "bg-blue-400" },
  { name: "JavaScript", dot: "bg-yellow-300" },
  { name: "Python", dot: "bg-sky-400" },
  { name: "C++", dot: "bg-pink-400" },
  { name: "C", dot: "bg-slate-400" },
  { name: "C#", dot: "bg-purple-400" },
  { name: "Java", dot: "bg-orange-400" },
  { name: "Go", dot: "bg-cyan-300" },
  { name: "Rust", dot: "bg-amber-600" },
  { name: "SQL", dot: "bg-emerald-400" },
  { name: "Bash", dot: "bg-lime-400" },
  { name: "HTML", dot: "bg-red-400" },
  { name: "CSS", dot: "bg-indigo-400" },
  { name: "JSON", dot: "bg-zinc-300" },
  { name: "Other", dot: "bg-zinc-500" },
] as const;

const TITLE_MAX = 80;
const CODE_MAX = 20000;
const TAGS_MAX = 8;
const TAG_LEN_MAX = 24;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const fieldClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors hover:border-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60";

function dotFor(language: string): string {
  return LANGUAGES.find((l) => l.name === language)?.dot ?? "bg-zinc-500";
}

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  return fallback;
}

function byNewest(a: Snippet, b: Snippet): number {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

function upsertSnippet(list: Snippet[], row: Snippet): Snippet[] {
  const exists = list.some((s) => s.id === row.id);
  const next = exists ? list.map((s) => (s.id === row.id ? row : s)) : [row, ...list];
  return next.sort(byNewest);
}

function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const tag = part.trim().replace(/^#+/, "").toLowerCase();
    if (tag) seen.add(tag);
  }
  return Array.from(seen);
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
    </svg>
  );
}

function StatusPill({ status }: { status: ConnectionStatus }) {
  const config = {
    connected: { label: "Live", dot: "bg-emerald-400", text: "text-emerald-300", ping: true },
    connecting: { label: "Connecting…", dot: "bg-amber-400", text: "text-amber-300", ping: true },
    disconnected: { label: "Offline", dot: "bg-red-400", text: "text-red-300", ping: false },
  }[status];

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium ${config.text}`}
    >
      <span className="relative flex h-2 w-2">
        {config.ping && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${config.dot}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
}

function SnippetCard({
  snippet,
  copied,
  onCopy,
  onDelete,
  onTagClick,
}: {
  snippet: Snippet;
  copied: boolean;
  onCopy: (snippet: Snippet) => void;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const lineCount = useMemo(() => snippet.code.split("\n").length, [snippet.code]);
  const isLong = lineCount > 12;

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(timer);
  }, [confirming]);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    await onDelete(snippet.id);
    setDeleting(false);
    setConfirming(false);
  }

  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-50" title={snippet.title}>
            {snippet.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-zinc-300">
              <span className={`h-1.5 w-1.5 rounded-full ${dotFor(snippet.language)}`} />
              {snippet.language}
            </span>
            <span>{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={snippet.created_at}>{timeAgo(snippet.created_at)}</time>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onCopy(snippet)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
              copied
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800"
            }`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label={confirming ? `Confirm delete ${snippet.title}` : `Delete ${snippet.title}`}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-60 ${
              confirming
                ? "border-red-500/40 bg-red-500/10 text-red-300"
                : "border-transparent text-zinc-500 hover:bg-zinc-800 hover:text-red-300"
            }`}
          >
            <TrashIcon />
            {deleting ? "Deleting…" : confirming ? "Confirm?" : null}
          </button>
        </div>
      </div>

      <div className="relative mt-3 border-y border-zinc-800 bg-[#0d0d0d]">
        <pre
          className={`overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-300 ${
            expanded ? "max-h-[28rem] overflow-y-auto" : "max-h-60 overflow-y-hidden"
          }`}
        >
          <code>{snippet.code}</code>
        </pre>
        {isLong && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {snippet.tags.length === 0 ? (
            <span className="text-xs text-zinc-600">No tags</span>
          ) : (
            snippet.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick(tag)}
                className="rounded-md bg-zinc-800/70 px-2 py-0.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              >
                #{tag}
              </button>
            ))
          )}
        </div>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="h-4 w-1/3 rounded bg-zinc-800" />
      <div className="mt-2 h-3 w-1/4 rounded bg-zinc-800/70" />
      <div className="mt-4 h-28 rounded bg-zinc-800/60" />
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-14 rounded bg-zinc-800/70" />
        <div className="h-5 w-12 rounded bg-zinc-800/70" />
      </div>
    </div>
  );
}

export default function Page() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(supabase));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<string>("TypeScript");
  const [code, setCode] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [langFilter, setLangFilter] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;

    async function load() {
      const { data, error } = await client
        .from("snippets")
        .select("id, title, language, code, tags, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (!active) return;
      if (error) {
        setLoadError(errorMessage(error, "Failed to load snippets."));
      } else {
        setLoadError(null);
        setSnippets((data ?? []) as Snippet[]);
      }
      setLoading(false);
    }

    void load();

    const channel = client
      .channel("devvault-snippets")
      .on("postgres_changes", { event: "*", schema: "public", table: "snippets" }, (payload) => {
        if (!active) return;
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const row = payload.new as Snippet;
          setSnippets((prev) => upsertSnippet(prev, row));
        } else if (payload.eventType === "DELETE") {
          const oldRow = payload.old as Partial<Snippet>;
          if (oldRow.id) {
            setSnippets((prev) => prev.filter((s) => s.id !== oldRow.id));
          }
        }
      })
      .subscribe((state) => {
        if (!active) return;
        if (state === "SUBSCRIBED") {
          setStatus("connected");
          void load();
        } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT" || state === "CLOSED") {
          setStatus("disconnected");
        } else {
          setStatus("connecting");
        }
      });

    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, [reloadKey]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target;
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const parsedTags = useMemo(() => parseTags(tagsInput), [tagsInput]);

  const languageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of snippets) counts.set(s.language, (counts.get(s.language) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [snippets]);

  const activeLang = langFilter && languageCounts.some(([l]) => l === langFilter) ? langFilter : null;

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return snippets.filter((s) => {
      if (activeLang && s.language !== activeLang) return false;
      if (terms.length === 0) return true;
      const haystack = `${s.title}\n${s.language}\n${s.tags.join(" ")}\n${s.code}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [snippets, query, activeLang]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase || submitting) return;

    const cleanTitle = title.trim();
    const cleanCode = code.replace(/^\s*\n/, "").trimEnd();
    const tags = parsedTags;

    if (!cleanTitle) return setFormError("Give your snippet a title.");
    if (cleanTitle.length > TITLE_MAX) return setFormError(`Title must be ${TITLE_MAX} characters or fewer.`);
    if (!cleanCode) return setFormError("Paste some code to save.");
    if (cleanCode.length > CODE_MAX) return setFormError(`Code must be ${CODE_MAX.toLocaleString()} characters or fewer.`);
    if (tags.length > TAGS_MAX) return setFormError(`Use at most ${TAGS_MAX} tags.`);
    if (tags.some((t) => t.length > TAG_LEN_MAX)) return setFormError(`Each tag must be ${TAG_LEN_MAX} characters or fewer.`);

    setSubmitting(true);
    setFormError(null);

    const { data, error } = await supabase
      .from("snippets")
      .insert({ title: cleanTitle, language, code: cleanCode, tags })
      .select("id, title, language, code, tags, created_at")
      .single();

    setSubmitting(false);

    if (error) {
      setFormError(errorMessage(error, "Failed to save snippet."));
      return;
    }

    setSnippets((prev) => upsertSnippet(prev, data as Snippet));
    setTitle("");
    setCode("");
    setTagsInput("");
  }

  async function handleCopy(snippet: Snippet) {
    const ok = await writeClipboard(snippet.code);
    if (!ok) {
      setNotice("Could not access the clipboard. Select the code and copy it manually.");
      return;
    }
    setCopiedId(snippet.id);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedId(null), 1800);
  }

  async function handleDelete(id: string) {
    if (!supabase) return;
    const target = snippets.find((s) => s.id === id);
    setSnippets((prev) => prev.filter((s) => s.id !== id));

    const { error } = await supabase.from("snippets").delete().eq("id", id);

    if (error) {
      setNotice(errorMessage(error, "Failed to delete snippet."));
      if (target) setSnippets((prev) => upsertSnippet(prev, target));
    }
  }

  function clearFilters() {
    setQuery("");
    setLangFilter(null);
  }

  if (!supabase) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 text-zinc-100">
        <div className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-900/60 p-6">
          <h1 className="text-lg font-semibold">DevVault needs Supabase credentials</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Add these to <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs">.env.local</code> and
            restart the dev server:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 antialiased">
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-200">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
              </svg>
            </span>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold tracking-tight">DevVault</h1>
              <p className="text-xs text-zinc-500">Your personal snippet library</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-500 sm:inline">
              {snippets.length} {snippets.length === 1 ? "snippet" : "snippets"}
            </span>
            <StatusPill status={status} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section aria-labelledby="new-snippet-title" className="lg:sticky lg:top-20 lg:self-start">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <h2 id="new-snippet-title" className="text-sm font-semibold text-zinc-50">
              New snippet
            </h2>
            <p className="mt-1 text-xs text-zinc-500">Saved snippets sync to every open tab instantly.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="title" className="mb-1.5 flex justify-between text-xs font-medium text-zinc-400">
                  <span>Title</span>
                  <span className="text-zinc-600">{title.length}/{TITLE_MAX}</span>
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={TITLE_MAX}
                  disabled={submitting}
                  placeholder="Debounce helper"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="language" className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={submitting}
                  className={`${fieldClass} [color-scheme:dark]`}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="code" className="mb-1.5 flex justify-between text-xs font-medium text-zinc-400">
                  <span>Code</span>
                  <span className={code.length > CODE_MAX ? "text-red-400" : "text-zinc-600"}>
                    {code.length.toLocaleString()}/{CODE_MAX.toLocaleString()}
                  </span>
                </label>
                <textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      formRef.current?.requestSubmit();
                    }
                  }}
                  disabled={submitting}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  rows={10}
                  placeholder="Paste your code here…"
                  className={`${fieldClass} resize-y font-mono text-[13px] leading-relaxed`}
                />
              </div>

              <div>
                <label htmlFor="tags" className="mb-1.5 flex justify-between text-xs font-medium text-zinc-400">
                  <span>Tags</span>
                  <span className="text-zinc-600">comma separated, max {TAGS_MAX}</span>
                </label>
                <input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  disabled={submitting}
                  placeholder="react, hooks, utils"
                  className={fieldClass}
                />
                {parsedTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {parsedTags.map((t) => (
                      <span
                        key={t}
                        className={`rounded-md px-2 py-0.5 text-xs ${
                          t.length > TAG_LEN_MAX ? "bg-red-500/10 text-red-300" : "bg-zinc-800/70 text-zinc-400"
                        }`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {formError && (
                <p role="alert" className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save Snippet"}
                {!submitting && (
                  <kbd className="hidden rounded border border-zinc-300 px-1.5 font-mono text-[10px] text-zinc-500 sm:inline">
                    Ctrl ↵
                  </kbd>
                )}
              </button>
            </div>
          </form>
        </section>

        <section aria-label="Saved snippets" className="min-w-0">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <SearchIcon />
            </span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, language, tag, or code…"
              aria-label="Search snippets"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2.5 pl-9 pr-12 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors hover:border-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-zinc-700 px-1.5 font-mono text-[10px] text-zinc-500 sm:block">
              /
            </kbd>
          </div>

          {languageCounts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by language">
              <button
                type="button"
                onClick={() => setLangFilter(null)}
                aria-pressed={activeLang === null}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  activeLang === null
                    ? "border-zinc-500 bg-zinc-800 text-zinc-50"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                All
              </button>
              {languageCounts.map(([lang, count]) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLangFilter(activeLang === lang ? null : lang)}
                  aria-pressed={activeLang === lang}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    activeLang === lang
                      ? "border-zinc-500 bg-zinc-800 text-zinc-50"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${dotFor(lang)}`} />
                  {lang}
                  <span className="text-zinc-600">{count}</span>
                </button>
              ))}
            </div>
          )}

          {notice && (
            <div
              role="alert"
              className="mt-4 flex items-start justify-between gap-4 rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss message"
                className="text-red-300/70 transition-colors hover:text-red-200"
              >
                ✕
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <span>
              {loading
                ? "Loading snippets…"
                : `Showing ${filtered.length} of ${snippets.length} ${snippets.length === 1 ? "snippet" : "snippets"}`}
            </span>
            {(query || activeLang) && (
              <button type="button" onClick={clearFilters} className="font-medium text-zinc-400 transition-colors hover:text-zinc-100">
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-3">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : loadError && snippets.length === 0 ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-14 text-center">
                <p className="text-sm font-medium text-red-300">Could not load snippets</p>
                <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">{loadError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setLoadError(null);
                    setReloadKey((k) => k + 1);
                  }}
                  className="mt-4 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
                >
                  Try again
                </button>
              </div>
            ) : snippets.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 px-6 py-16 text-center">
                <p className="text-sm font-medium text-zinc-300">Your vault is empty</p>
                <p className="mt-1 text-xs text-zinc-500">Save your first snippet using the form.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 px-6 py-16 text-center">
                <p className="text-sm font-medium text-zinc-300">No snippets match your search</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filtered.map((s) => (
                  <SnippetCard
                    key={s.id}
                    snippet={s}
                    copied={copiedId === s.id}
                    onCopy={handleCopy}
                    onDelete={handleDelete}
                    onTagClick={(tag) => {
                      setQuery(tag);
                      searchRef.current?.focus();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}