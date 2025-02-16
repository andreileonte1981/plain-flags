import Client from "~/client/client";
import type { Route } from "../../../+types/root";
import { useState } from "react";
import { redirect } from "react-router";
import FilterEdit from "../../components/reusables/filterEdit";

import { Role, type User } from "~/domain/user";
import UserList from "./components/userList";
import CreateUsersPanel from "./components/createUsersPanel";
import CreateAdminPanel from "./components/createAdminPanel";

export async function clientLoader({}) {
  const myRole = localStorage.getItem("role");
  if (myRole !== Role.ADMIN && myRole !== Role.SUPERADMIN) {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    alert("Unauthorized");

    window.location.reload();
  }

  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }

  const response = await Client.get("users");

  return response?.data;
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const unfilteredUsers: User[] | undefined = loaderData as User[] | undefined;

  if (!unfilteredUsers) {
    return <div>Loading...</div>;
  }

  const [mailFilter, setMailFilter] = useState("");

  const users = unfilteredUsers.filter(
    (u) => u.email.toLowerCase().indexOf(mailFilter.toLowerCase()) >= 0
  );

  return (
    <div className="mx-2 flex flex-col">
      <div id="usersHeader" className="sticky top-0 z-10 bg-white">
        <div className="flex flex-col flex-wrap items-center justify-center border-b-4">
          <CreateUsersPanel />
          <CreateAdminPanel />
          <div id="userFilters" className="p-2">
            <FilterEdit
              onChange={(e) => {
                setMailFilter(e.target.value);
              }}
              placeholder="Find user by email"
              tooltip=""
            />
          </div>
        </div>
      </div>

      <UserList users={users} />
    </div>
  );
}
