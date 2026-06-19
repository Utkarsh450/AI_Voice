"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/session.service";

export const useSummary = (
  sessionId: number | null
) => {
  return useQuery({
    queryKey: [
      "summary",
      sessionId,
    ],
    queryFn: () =>
      sessionService.getSummary(
        sessionId!
      ),
    enabled: !!sessionId,
  });
};