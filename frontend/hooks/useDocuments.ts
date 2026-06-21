"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export function useDocuments() {
  return useQuery({
    queryKey: [
      "documents",
    ],
    queryFn:
      adminService
        .getDocuments,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}