import type { Flag } from "~/domain/flag";
import FlagListItems from "./flagListItems";
import { useState } from "react";
import FlagFilters from "./flagFilters";

export default function FlagList(props: { flags: Flag[] | undefined }) {
  const [filters, setFilters] = useState({
    name: "",
    constraint: "",
    stale: false,
    active: false,
  });

  const flags = props.flags
    ?.filter((f) => f.name.indexOf(filters.name) >= 0)
    .filter((f) => (filters.stale ? f.stale : true))
    .filter((f) => (filters.active ? f.isOn : true));

  const [isCreateOpen, setCreateOpen] = useState(false);

  return (
    <div className="mx-2 flex flex-col">
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex justify-between items-center border-b-4 py-2 ">
          <FlagFilters setFilters={setFilters} filters={filters} />
          <button
            className="bg-green-900 text-white font-bold uppercase text-sm m-3 p-3 px-5 cursor-pointer hover:bg-green-600 active:bg-green-700 rounded flex-none flex items-center"
            onClick={() => {
              setCreateOpen(!isCreateOpen);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Create flag
          </button>
        </div>
        {isCreateOpen && <div className="border-b-4">Create flag panel</div>}
      </div>
      <ul className="flex flex-col w-full h-full">{FlagListItems(flags)}</ul>
    </div>
  );
}
