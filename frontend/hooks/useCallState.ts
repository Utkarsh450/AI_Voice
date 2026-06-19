"use client";

import { useState } from "react";
import { CallState } from "@/types/call";

export function useCallState() {
  const [state, setState] =
    useState<CallState>("idle");

  return {
    state,
    setState,
  };
}