"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export function useCallsTrend() {
  return useQuery({
    queryKey: [
      "calls-trend",
    ],
    queryFn:
      adminService.getCallsTrend,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}