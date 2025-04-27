import { redirect } from "react-router";
import Client from "~/client/client";
import type { Route } from "../../../+types/root";
import { useEffect, useState } from "react";

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
}

export default function Component() {
  let pageSize = 20;
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(-1);
  const [flags, setFlags] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function fetchFlags() {
      const response = await Client.get(
        `flags/archivedpage?page=${page}&pageSize=${pageSize}&filter=${filter}`
      );

      setFlags(response?.data.flags);
      setTotalCount(response?.data.count);
    }

    fetchFlags();
  }, [page, filter]);

  if (totalCount < 0) {
    return <div>Loading flags...</div>;
  }

  const currentIndices = `${(page - 1) * pageSize + 1} to ${Math.min(
    page * pageSize,
    totalCount
  )} of ${totalCount}`;

  return (
    <div className="md:mx-2 flex flex-col">
      <div id="archivedHeader" className="sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-10 border-b-4 py-2">
          <div
            id="pagination"
            className="flex items-center gap-1 text-gray-600"
          >
            <button
              id="first"
              className="bg-gray-200 p-2 rounded hover:bg-gray-300 active:bg-gray-500"
              onClick={() => setPage(1)}
            >
              {"<<"}
            </button>
            <button
              id="prev"
              className="bg-gray-200 p-2 rounded hover:bg-gray-300 active:bg-gray-500"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              {"<"}
            </button>
            <p>{currentIndices}</p>
            <button
              id="next"
              className="bg-gray-200 p-2 rounded hover:bg-gray-300 active:bg-gray-500"
              onClick={() =>
                setPage((p) =>
                  Math.min(p + 1, Math.ceil(totalCount / pageSize))
                )
              }
            >
              {">"}
            </button>
            <button
              id="first"
              className="bg-gray-200 p-2 rounded hover:bg-gray-300 active:bg-gray-500"
              onClick={() => setPage(Math.ceil(totalCount / pageSize))}
            >
              {">>"}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <FilterEdit
              onChange={(e) => {
                setFilter(e.target.value);
              }}
              placeholder="Name"
              tooltip="Search for archived features by name"
            />
          </div>
        </div>
      </div>

      <ArchivedList flags={flags} />
    </div>
  );
}
