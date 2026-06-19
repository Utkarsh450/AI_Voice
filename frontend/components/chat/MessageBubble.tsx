"use client";

import { LiveMessage } from "@/types/message";

interface Props {
  message: LiveMessage;
}

export default function MessageBubble({
  message,
}: Props) {
  const isUser =
    message.speaker ===
    "USER";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-3xl px-5 py-4 ${
          isUser
            ? "bg-blue-600 text-white"
            : "border border-slate-800 bg-slate-900 text-slate-100"
        }`}
      >
        <p className="mb-2 text-xs font-semibold uppercase opacity-70">
          {isUser
            ? "You"
            : "AI"}
        </p>

        <p className="whitespace-pre-wrap leading-7">
          {message.text}
        </p>
      </div>
    </div>
  );
}