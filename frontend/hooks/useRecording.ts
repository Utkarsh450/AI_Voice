"use client";

import { useQuery } from "@tanstack/react-query";
import { recordingService } from "@/services/recording.service";

export function useRecording(
  sessionId:
    number | null
) {
  return useQuery({
    queryKey: [
      "recording",
      sessionId,
    ],

    queryFn: () =>
      recordingService.getRecording(
        sessionId!
      ),

    enabled:
      !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}