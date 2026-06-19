"use client";

import {
  useState,
} from "react";

import UserSearch from "@/components/admin/users/UserSearch";
import UsersGrid from "@/components/admin/users/UsersGrid";
import UserDetailsDrawer from "@/components/admin/users/UserDetailsDrawer";

export default function UsersPage() {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<
    string | null
  >(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold">
          Users
        </h1>

        <p className="mt-2 text-slate-400">
          Manage users,
          sessions and memory
        </p>
      </div>

      <UserSearch
        value={search}
        onChange={
          setSearch
        }
      />

      <UsersGrid
        search={search}
        onSelectUser={
          setSelectedUser
        }
      />

      <UserDetailsDrawer
        userId={
          selectedUser
        }
        onClose={() =>
          setSelectedUser(
            null
          )
        }
      />
    </div>
  );
}