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
  const [isMuted, setIsMuted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);

  const toggleMute = async () => {
    if (roomRef.current) {
      const nextMute = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!nextMute);
      setIsMuted(nextMute);
    }
  };

  const connect = async (sessionId: number) => {
    try {
      setConnecting(true);
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
        setConnecting(false);
        setAgentConnected(room.remoteParticipants.size > 0);
        setCallState("listening");
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("Room Disconnected");

        setConnected(false);
        setConnecting(false);
        setAgentConnected(false);
        setCallState("idle");
        setIsMuted(false);
      });

      room.on(RoomEvent.ParticipantConnected, (p) => {
        console.log("Participant Connected:", p.identity);
        setAgentConnected(true);
      });

      room.on(RoomEvent.ParticipantDisconnected, (p) => {
        console.log("Participant Disconnected:", p.identity);
        if (room.remoteParticipants.size === 0) {
          setAgentConnected(false);
        }
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
      setIsMuted(false);

      setTimeout(() => {
  queryClient.invalidateQueries({
    queryKey: ["sessions"],
  });
}, 1000);

    } catch (error) {
      console.error("Voice connection error:", error);
      setConnecting(false);
    }
  };

  const disconnect = () => {
    roomRef.current?.disconnect();
    roomRef.current = null;

    setConnected(false);
    setConnecting(false);
    setAgentConnected(false);
    setCallState("idle");
    setIsMuted(false);
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
    isMuted,
    toggleMute,
    connecting,
    agentConnected,
  };
}
