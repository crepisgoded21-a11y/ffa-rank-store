"use client";

import { useState } from "react";

export default function CopyIP({ ip }: { ip: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(ip);
      } else {
        const ta = document.createElement("textarea");
        ta.value = ip;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error("copy failed", e);
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy server IP"
      title={copied ? "Copied" : "Click to copy"}
      className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 backdrop-blur-xl transition-all duration-300 hover:border-indigo-400/40 hover:bg-white/10 cursor-pointer"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="font-mono font-medium tracking-tight select-all">{ip}</span>
      <span
        className={`text-xs transition-all duration-300 ${
          copied ? "text-emerald-300 opacity-100" : "text-slate-500 opacity-0 group-hover:opacity-100"
        }`}
      >
        {copied ? "Copied!" : "Copy"}
      </span>
    </button>
  );
}
