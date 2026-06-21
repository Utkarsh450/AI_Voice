"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export function useUsers() {
  return useQuery({
    queryKey: [
      "users",
    ],
    queryFn:
      adminService
        .getUsers,
    staleTime: 15 * 1000, // 15 seconds
    refetchOnWindowFocus: false,
  });
}