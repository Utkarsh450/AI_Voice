"use client";

import { useUsers } from "@/hooks/useUsers";
import UserCard from "./UserCard";

interface Props {
  search: string;
  onSelectUser: (
    id: string
  ) => void;
}

export default function UsersGrid({
  search,
  onSelectUser,
}: Props) {
  const {
    data,
    isLoading,
  } = useUsers();

  if (isLoading) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const users =
    data?.filter(
      (u: any) =>
        u.userId
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    ) ?? [];

  return (
    <div
      className="
      grid
      gap-6
      md:grid-cols-2
      xl:grid-cols-3
    "
    >
      {users.map(
        (user: any) => (
          <UserCard
            key={
              user.userId
            }
            user={user}
            onClick={() =>
              onSelectUser(
                user.userId
              )
            }
          />
        )
      )}
    </div>
  );
}