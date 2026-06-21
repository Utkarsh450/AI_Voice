"use client";

import { useUsers } from "@/hooks/useUsers";
import UserCard from "./UserCard";

interface Props {
  search: string;
  onSelectUser: (
    id: string
  ) => void;
}

export default function UsersGrid({ search, onSelectUser }: Props) {
  const { data, isLoading } = useUsers();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-3xl border border-blue-900/20 bg-blue-950/10 p-6 min-h-[190px] animate-pulse flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="h-13 w-13 rounded-2xl bg-blue-950/20" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-blue-950/20 rounded w-3/4" />
                <div className="h-3 bg-blue-950/10 rounded w-1/2" />
              </div>
            </div>
            <div className="h-4 bg-blue-950/20 rounded w-full mt-6" />
          </div>
        ))}
      </div>
    );
  }

  const users =
    data?.filter((u: any) =>
      u.userId.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  if (users.length === 0) {
    return (
      <div className="py-16 text-center border border-blue-900/30 rounded-3xl bg-blue-950/10 max-w-lg mx-auto">
        <p className="text-sm text-slate-500 font-medium">No callers match your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {users.map((user: any) => (
        <UserCard
          key={user.userId}
          user={user}
          onClick={() => onSelectUser(user.userId)}
        />
      ))}
    </div>
  );
}