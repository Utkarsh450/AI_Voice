"use client";

import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/session.service";

export const useSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: sessionService.getSessions,
  });
};