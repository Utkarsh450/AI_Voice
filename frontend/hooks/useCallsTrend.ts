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
  });
}