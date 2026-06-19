"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export const useSystemHealth =
  () =>
    useQuery({
      queryKey: ["health"],
      queryFn:
        adminService.getHealth,
      refetchInterval: 5000,
    });