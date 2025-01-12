import type { Flag } from "~/domain/flag";
import FlagListItems from "./flagListItems";
import { useState } from "react";

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

  return (
    <div className="mx-2 flex flex-col">
      <div className="sticky top-0 flex justify-between items-center border-b-4 py-2 bg-white z-10">
        <div className="flex flex-wrap items-center text-gray-600 font-semibold border-r-2 px-3">
          <label htmlFor="nameFilter" className="m-2">
            Name
            <input
              id="nameFilter"
              name="nameFilter"
              type="text"
              className="ml-2 border rounded p-2"
              onChange={(e) => {
                setFilters({ ...filters, name: e.target.value });
              }}
            />
          </label>
          <label htmlFor="constraintFilter" className="m-2">
            Constraint
            <input
              id="constraintFilter"
              name="constraintFilter"
              type="text"
              className="ml-2 border rounded p-2"
            />
          </label>
          <div>
            <label htmlFor="staleFilter" className="m-2">
              Stale
              <input
                id="staleFilter"
                name="staleFilter"
                type="checkbox"
                className="ml-2 border rounded"
                onChange={(e) => {
                  setFilters({ ...filters, stale: e.target.checked });
                }}
              />
            </label>
            <label htmlFor="activeFilter" className="m-2">
              Active
              <input
                id="activeFilter"
                name="activeFilter"
                type="checkbox"
                className="ml-2 border rounded"
                onChange={(e) => {
                  setFilters({ ...filters, active: e.target.checked });
                }}
              />
            </label>
          </div>
        </div>

        <button className="bg-green-900 text-white font-bold uppercase text-sm m-3 p-3 px-5 cursor-pointer hover:bg-green-600 rounded flex-none flex items-center">
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
      <ul className="flex flex-col w-full h-full">{FlagListItems(flags)}</ul>
    </div>
  );
}
