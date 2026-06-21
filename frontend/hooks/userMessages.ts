"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/session.service";

export function useMessages(
  sessionId: number | null
) {
  return useQuery({
    queryKey: [
      "messages",
      sessionId,
    ],
    queryFn: () =>
      sessionService.getMessages(
        sessionId!
      ),
    enabled: !!sessionId,
    staleTime: 10 * 1000, // 10 seconds
    refetchOnWindowFocus: false,
  });
}