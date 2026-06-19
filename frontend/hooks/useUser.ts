"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export const useUser = (
  userId?: string
) =>
  useQuery({
    queryKey: [
      "user",
      userId,
    ],

    queryFn: () =>
      adminService.getUser(
        userId!
      ),

    enabled:
      !!userId,
  });