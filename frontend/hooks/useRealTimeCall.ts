"use client";

import { useEffect, useState } from "react";
import { CallState } from "@/types/call";
import { LiveMessage } from "@/types/message";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeCall(sessionId: number | null) {
  const queryClient = useQueryClient();
  const [transcript, setTranscript] = useState("");

  const [messages, setMessages] = useState<LiveMessage[]>([]);

  const [state, setState] = useState<CallState>("idle");

  useEffect(() => {
    console.log("CALL STATE:", state);
  }, [state]);

  useEffect(() => {
    console.log("TRANSCRIPT:", transcript);
  }, [transcript]);

  useEffect(() => {
    console.log("Creating websocket...");

    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      console.log("WS OPENED");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("WS MESSAGE:", data);

      // Ignore only if a session is selected
      // if (sessionId && Number(data.sessionId) !== Number(sessionId)) {
      //   return;
      // }

      if (data.type === "transcript") {
        setTranscript(data.text);

        setMessages((prev) => [
          ...prev,
          {
            speaker: data.speaker,
            text: data.text,
          },
        ]);
      }
      console.log("SESSION ID:", sessionId);
console.log("WS DATA:", data);

      if (data.type === "state") {
        console.log("SETTING:", data.state);

        setState(data.state);

     if (
  data.type ===
  "transcript"
) {
  setTranscript(
    data.text
  );

  if (
    data.speaker ===
    "ASSISTANT"
  ) {
    setState(
      "speaking"
    );

    setTimeout(() => {
      setState(
        "listening"
      );
    }, 2500);
  }
}
      }

      if (data.type === "persona_update") {
        console.log("Persona update received:", data.persona);
        queryClient.invalidateQueries({
          queryKey: ["session", sessionId],
        });
        queryClient.invalidateQueries({
          queryKey: ["sessions"],
        });
      }
    };

    ws.onclose = () => {
      console.log("WS CLOSED");
    };

    return () => ws.close();
  }, [sessionId]);

  return {
    transcript,
    messages,
    state,
  };
}
