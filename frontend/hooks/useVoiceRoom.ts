"use client";

import { useRef, useState, useEffect } from "react";
import { Room, RoomEvent, RemoteAudioTrack } from "livekit-client";
import { useQueryClient } from "@tanstack/react-query";

import { livekitService } from "@/services/livekit.service";
import { CallState } from "@/types/call";

export function useVoiceRoom() {
  const roomRef = useRef<Room | null>(null);

  const queryClient = useQueryClient();

  const [connected, setConnected] = useState(false);

  const [callState, setCallState] = useState<CallState>("idle");


  const connect = async (sessionId: number) => {
    try {
      await livekitService.dispatchAgent(sessionId);
       console.log(
    "CONNECT CALLED:",
    sessionId
  );

      const { token, url } = await livekitService.getToken(sessionId);

      const room = new Room();

      roomRef.current = room;

      room.on(RoomEvent.Connected, () => {
        console.log("Room Connected");

        setConnected(true);
        setCallState("listening");
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("Room Disconnected");

        setConnected(false);
        setCallState("idle");
      });

      room.on(RoomEvent.TrackSubscribed, (track) => {
        console.log("Track Subscribed");

        if (track instanceof RemoteAudioTrack) {
          track.attach();

          setCallState("speaking");

          queryClient.invalidateQueries({
            queryKey: ["messages"],
          });
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track instanceof RemoteAudioTrack) {
          track.detach();

          setCallState("listening");

          queryClient.invalidateQueries({
            queryKey: ["messages"],
          });
        }
      });

      await room.connect(url, token);

      await room.localParticipant.setMicrophoneEnabled(true);

      setTimeout(() => {
  queryClient.invalidateQueries({
    queryKey: ["sessions"],
  });
}, 1000);

    } catch (error) {
      console.error("Voice connection error:", error);
    }
  };

  const disconnect = () => {
    roomRef.current?.disconnect();
    roomRef.current = null;

    setConnected(false);
    setCallState("idle");
  };

  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [connected, queryClient]);

  return {
    connected,
    callState,
    connect,
    disconnect,
  };
}
