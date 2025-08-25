"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession } from "next-auth/react";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function ChatBox() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi! Ask me anything about career planning." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  // auth (for Sign in button visibility)
  const { status } = useSession();
  const signedOut = status !== "authenticated";

  // auto-scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  async function send() {
    const content = (inputRef.current?.value ?? "").trim();
    if (!content || sending) return;

    const nextMsgs: ChatMsg[] = [...msgs, { role: "user", content }];
    setMsgs(nextMsgs);
    if (inputRef.current) inputRef.current.value = "";
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMsgs }),
      });

      const ct = res.headers.get("content-type") ?? "";

      // JSON (errors like 401/429)
      if (ct.includes("application/json")) {
        const data: any = await res.json().catch(() => ({}));
        const errMsg = data?.error || `Request failed (${res.status})`;
        setMsgs([...nextMsgs, { role: "assistant", content: errMsg }]);
        return;
      }

      // Streamed text/plain
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      // push empty assistant message to progressively fill
      setMsgs((curr) => [...curr, { role: "assistant", content: "" }]);

      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMsgs((curr) => {
          const copy = curr.slice();
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMsgs((curr) => [
        ...curr,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") send();
  }

  function clearChat() {
    setMsgs([{ role: "assistant", content: "Chat cleared. Ask a new question!" }]);
  }

  return (
    <div
      className="
        mx-auto flex h-[80vh] w-full max-w-3xl flex-col rounded-2xl
        border border-black/10 dark:border-white/10
        bg-card text-foreground p-4
      "
    >
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Career Mentor</h2>

        <div className="flex items-center gap-2">
          {/* Sign In (visible only when not authenticated) */}
          {signedOut && (
            <a
              href="/signin"
              className="rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 
                         px-4 py-1.5 text-sm font-medium text-white shadow 
                         hover:scale-105 transition-transform"
            >
              Sign in
            </a>
          )}

          {/* Clear */}
          <button
            onClick={clearChat}
            className="rounded-full border border-rose-300 px-4 py-1.5 text-sm font-medium 
                       text-rose-600 hover:bg-rose-600 hover:text-white 
                       shadow-sm transition-colors"
            title="Clear this conversation"
          >
            Clear
          </button>
        </div>
      </div>

      {/* messages */}
      <div
        ref={listRef}
        className="
          flex-1 space-y-3 overflow-auto rounded-xl
          border border-black/10 dark:border-white/10
          bg-background p-3
        "
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[90%] rounded-2xl px-3 py-2 text-white bg-blue-600 dark:bg-indigo-600"
                : "mr-auto max-w-[90%] rounded-2xl px-3 py-2 bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-gray-100"
            }
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: (props) => (
                  <div className="overflow-auto">
                    <table className="w-full border-collapse text-sm" {...props} />
                  </div>
                ),
                th: (props) => (
                  <th className="border px-2 py-1 text-left font-semibold" {...props} />
                ),
                td: (props) => <td className="border px-2 py-1 align-top" {...props} />,
                p: (props) => <p className="whitespace-pre-wrap leading-relaxed" {...props} />,
                li: (props) => <li className="leading-relaxed" {...props} />,
              }}
            >
              {m.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      {/* input */}
      <div className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          onKeyDown={onKeyDown}
          placeholder={sending ? "Thinking..." : "Type your message..."}
          className="
            grow rounded-xl px-3 py-2 outline-none focus:ring
            border border-black/10 dark:border-white/10
            bg-background text-foreground
          "
          disabled={sending}
        />
        <button
          onClick={send}
          disabled={sending}
          className="
            rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 
            px-6 py-2 text-sm font-medium text-white shadow-md 
            hover:opacity-90 disabled:opacity-50 transition-transform 
            hover:-translate-y-0.5
          "
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
