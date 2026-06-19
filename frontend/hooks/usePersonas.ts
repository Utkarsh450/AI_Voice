"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export function usePersonas() {
  return useQuery({
    queryKey: [
      "personas",
    ],
    queryFn:
      adminService
        .getPersonas,
  });
}