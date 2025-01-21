import type { Flag } from "~/domain/flag";
import FlagListItems from "./flagListItems";
import { useState } from "react";
import FlagFilters from "./flagFilters";
import GreenPlusButton from "../reusables/greenPlusButton";
import CreateFlagPanel from "./createFlagPanel";

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
          <GreenPlusButton
            onClick={() => {
              setCreateOpen(!isCreateOpen);
            }}
            text="Create new flag"
          ></GreenPlusButton>
        </div>
        {isCreateOpen && <CreateFlagPanel setCreateOpen={setCreateOpen} />}
      </div>
      <ul className="flex flex-col w-full h-full">{FlagListItems(flags)}</ul>
    </div>
  );
}
