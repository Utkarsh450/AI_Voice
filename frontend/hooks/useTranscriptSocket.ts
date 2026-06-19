"use client";

import { useEffect, useState } from "react";

export const useTranscriptSocket = () => {
  const [transcript, setTranscript] =
    useState("");

  useEffect(() => {
    const ws = new WebSocket(
      "ws://localhost:8000/ws"
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(
        event.data
      );

      if (
        data.type ===
        "transcript"
      ) {
        setTranscript(
          data.text
        );
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return transcript;
};