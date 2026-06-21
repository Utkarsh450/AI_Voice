"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/session.service";

export const useSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: sessionService.getSessions,
    staleTime: 15 * 1000, // 15 seconds
    refetchOnWindowFocus: false,
  });
};