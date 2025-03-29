import { redirect } from "react-router";
import type { Flag } from "~/domain/flag";
import Client from "~/client/client";
import type { Route } from "../../../+types/root";
import { useState } from "react";

import FilterEdit from "~/ui/components/reusables/filterEdit";
import ArchivedList from "./components/archived/archivedList";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Archived Feature Flags" },
    { name: "description", content: "See archived feature flags" },
  ];
}

export async function clientLoader({}) {
  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }

  const response = await Client.get("flags/archived");

  return response?.data;
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const unfilteredFlags: Flag[] | undefined = loaderData as Flag[] | undefined;

  if (!unfilteredFlags) {
    return <div>Loading...</div>;
  }

  if (unfilteredFlags.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <h1 className="text-gray-400 my-10">No flags were archived</h1>
      </div>
    );
  }

  const [filter, setFilter] = useState("");

  const flags = unfilteredFlags?.filter(
    (f) => f.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0
  );

  return (
    <div className="md:mx-2 flex flex-col">
      <div id="archivedHeader" className="sticky top-0 z-10 bg-white">
        <div className="flex justify-between items-center border-b-4 py-2 ">
          <FilterEdit
            onChange={(e) => {
              setFilter(e.target.value);
            }}
            placeholder="Name"
            tooltip="Search for archived features by name"
          />
        </div>
      </div>

      <ArchivedList flags={flags} />
    </div>
  );
}
