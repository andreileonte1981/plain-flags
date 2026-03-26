import { redirect, useNavigate } from "react-router";
import { getApiClient, User } from "~/client/api-client";
import { useState } from "react";
import UserList from "./userList";
import CreateUsersPanel from "./createUsersPanel";
import CreateAdminPanel from "./createAdminPanel";
import { getFirebaseAuth } from "~/firebase";
import { Route } from "../+types";

export function meta() {
  return [
    { title: "Users - Plain Flags" },
    { name: "description", content: "Create and delete users" },
  ];
}

export async function clientLoader() {
  // Only admin/superadmin may view this page
  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;
  if (role !== "admin" && role !== "superadmin") {
    return redirect("/flags");
  }

  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    return redirect("/login");
  }

  const users = await getApiClient().listUsers();
  return { users };
}

export default function UsersPage({ loaderData }: Route.ComponentProps) {
  const { users: initial } = loaderData as { users: User[] };
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>(initial);
  const [filter, setFilter] = useState("");

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(filter.toLowerCase()),
  );

  async function reload() {
    try {
      const fresh = await getApiClient().listUsers();
      setUsers(fresh);
    } catch {
      // ignore
    }
  }

  function handleDeleted(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="md:mx-2 flex flex-col">
      <div className="sticky md:top-0 top-12 z-10 bg-white">
        <div className="flex flex-col flex-wrap items-center justify-center border-b-4">
          <div className="flex items-center gap-2 py-2">
            <input
              type="search"
              className="md:w-64 w-48 m-1 border-2 rounded p-1 focus:ring-0 focus:border-current placeholder-gray-300"
              placeholder="Filter by email"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <CreateUsersPanel onCreated={reload} />
          <CreateAdminPanel onCreated={reload} />
        </div>
      </div>

      <UserList users={filtered} onDeleted={handleDeleted} />
    </div>
  );
}
