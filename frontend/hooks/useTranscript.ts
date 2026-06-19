"use client";

import { useEffect, useState } from "react";

export function useTranscript(sessionId: number | null) {
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "transcript" && data.sessionId === sessionId) {
        setTranscript(data.text);
      }
    };

    return () => ws.close();
  }, [sessionId]);

  return transcript;
  
  
}