"use client";

import {
  useState,
} from "react";

import UserSearch from "@/components/admin/users/UserSearch";
import UsersGrid from "@/components/admin/users/UsersGrid";
import UserDetailsDrawer from "@/components/admin/users/UserDetailsDrawer";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <div className="space-y-7 max-w-[1600px] mx-auto animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Users & Memory
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor caller identities, review accumulated global facts, and navigate individual call histories.
          </p>
        </div>
      </div>

      {/* SEARCH INPUT BAR */}
      <div className="max-w-md">
        <UserSearch value={search} onChange={setSearch} />
      </div>

      {/* USERS LIST GRID */}
      <UsersGrid search={search} onSelectUser={setSelectedUser} />

      {/* USER DETAILS SIDE-PANEL DRAWER */}
      <UserDetailsDrawer
        userId={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}