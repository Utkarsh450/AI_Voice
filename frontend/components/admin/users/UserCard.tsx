"use client";

import {
  User,
  Phone,
} from "lucide-react";

interface Props {
  user: any;
  onClick: () => void;
}

export default function UserCard({
  user,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="
      rounded-3xl
      border border-slate-800
      bg-slate-900/40
      p-6
      text-left
      transition
      hover:border-blue-500
    "
    >
      <div className="flex items-center gap-4">
        <div
          className="
          flex h-14 w-14
          items-center justify-center
          rounded-2xl
          bg-blue-500/20
        "
        >
          <User />
        </div>

        <div>
          <h3 className="font-semibold">
            {user.userId}
          </h3>

          <p className="text-sm text-slate-400">
            Last active:
            {" "}
            {user.lastActive
              ? new Date(
                  user.lastActive
                ).toLocaleDateString()
              : "-"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-slate-400">
        <Phone
          size={16}
        />

        <span>
          {user.totalCalls}
          {" "}
          Calls
        </span>
      </div>
    </button>
  );
}