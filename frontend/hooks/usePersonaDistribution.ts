"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export function usePersonaDistribution() {
  return useQuery({
    queryKey: [
      "persona-distribution",
    ],
    queryFn:
      adminService
        .getPersonaDistribution,
  });
}