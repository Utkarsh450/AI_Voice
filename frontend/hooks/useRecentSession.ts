"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export function useRecentSessions() {
  return useQuery({
    queryKey: [
      "recent-sessions",
    ],
    queryFn:
      adminService
        .getRecentSessions,
  });
}