"use client";

import {
  X,
  User,
  Brain,
  Phone,
  Clock,
} from "lucide-react";

import { useUser } from "@/hooks/useUser";

interface Props {
  userId: string | null;
  onClose: () => void;
}

export default function UserDetailsDrawer({
  userId,
  onClose,
}: Props) {
  const {
    data,
    isLoading,
  } = useUser(
    userId ?? undefined
  );

  return (
    <div
      className={`
      fixed
      right-0
      top-0
      z-50
      h-screen
      w-[480px]
      overflow-y-auto
      border-l border-slate-800
      bg-slate-950
      transition-transform
      duration-300
      ${
        userId
          ? "translate-x-0"
          : "translate-x-full"
      }
    `}
    >
      <div className="flex items-center justify-between border-b border-slate-800 p-6">
        <div>
          <h2 className="text-2xl font-bold">
            User Details
          </h2>

          <p className="text-slate-400">
            Conversation memory
          </p>
        </div>

        <button
          onClick={onClose}
          className="
          rounded-xl
          border border-slate-800
          p-2
          hover:bg-slate-900
        "
        >
          <X size={20} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-6">
          Loading...
        </div>
      ) : (
        <div className="space-y-6 p-6">
          {/* USER */}

          <div
            className="
            rounded-3xl
            border border-slate-800
            bg-slate-900/40
            p-6
          "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                flex h-16 w-16
                items-center justify-center
                rounded-2xl
                bg-blue-500/20
              "
              >
                <User />
              </div>

              <div>
                <h3 className="text-xl font-semibold">
                  {data?.userId}
                </h3>

                <p className="text-slate-400">
                  AI Platform User
                </p>
              </div>
            </div>
          </div>

          {/* MEMORY */}

          <div
            className="
            rounded-3xl
            border border-slate-800
            bg-slate-900/40
            p-6
          "
          >
            <div className="mb-4 flex items-center gap-3">
              <Brain />
              <h3 className="font-semibold">
                Global Memory
              </h3>
            </div>

            <p
              className="
              whitespace-pre-wrap
              text-sm
              text-slate-300
            "
            >
              {data?.memory ||
                "No memory yet"}
            </p>
          </div>

          {/* SESSIONS */}

          <div
            className="
            rounded-3xl
            border border-slate-800
            bg-slate-900/40
            p-6
          "
          >
            <div className="mb-4 flex items-center gap-3">
              <Phone />
              <h3 className="font-semibold">
                Sessions
              </h3>
            </div>

            <div className="space-y-3">
              {data?.sessions?.map(
                (session: any) => (
                  <div
                    key={
                      session.id
                    }
                    className="
                    rounded-2xl
                    border border-slate-800
                    bg-slate-950/50
                    p-4
                  "
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {
                          session.roomName
                        }
                      </p>

                      <span
                        className={`
                        rounded-full
                        px-3 py-1
                        text-xs
                        ${
                          session.status ===
                          "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }
                      `}
                      >
                        {
                          session.status
                        }
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <Clock
                        size={14}
                      />

                      {new Date(
                        session.startedAt
                      ).toLocaleString()}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}