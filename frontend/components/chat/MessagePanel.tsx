"use client";

import { LiveMessage } from "@/types/message";
import ConversationTimeline from "./ConversationTimeline";

interface Props {
  messages: LiveMessage[];
}

export default function MessagePanel({
  messages,
}: Props) {
  return (
    <ConversationTimeline
      messages={
        messages
      }
    />
  );
}