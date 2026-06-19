"use client";

import {
  useEffect,
  useRef,
} from "react";

import { LiveMessage } from "@/types/message";
import MessageBubble from "./MessageBubble";

interface Props {
  messages: LiveMessage[];
}

export default function ConversationTimeline({
  messages,
}: Props) {
  const bottomRef =
    useRef<HTMLDivElement>(
      null
    );

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior:
          "smooth",
      }
    );
  }, [messages]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-t-3xl border-t border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">
          Conversation Timeline
        </h3>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {messages.length ===
          0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-400">
            Start speaking to begin the conversation.
          </div>
        )}

        {messages.map(
          (
            message,
            index
          ) => (
            <MessageBubble
              key={
                index
              }
              message={
                message
              }
            />
          )
        )}

        <div
          ref={
            bottomRef
          }
        />
      </div>
    </div>
  );
}