"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/session.service";

export const useSession = (
  sessionId: number | null
) => {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () =>
      sessionService.getSession(
        sessionId!
      ),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};