import type { Flag } from "~/domain/flag";
import FlagListItems from "./flagListItems";
import { useState } from "react";
import FlagFilters from "./flagFilters";
import GreenPlusButton from "../greenPlusButton";
import CancelButton from "../cancelButton";
import YesNo from "../yesno";
import LocalError from "../localError";

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

  const [newFlagName, setNewFlagName] = useState("");

  const [createFlagYNOpen, setCreateFlagYNOpen] = useState(false);

  const [newFlagError, setNewFlagError] = useState("");

  function onCreate() {
    if (!newFlagName) {
      setNewFlagError("New flag name required");
      return;
    }
    setCreateFlagYNOpen(true);
  }

  return (
    <div className="mx-2 flex flex-col">
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex justify-between items-center border-b-4 py-2 ">
          <FlagFilters setFilters={setFilters} filters={filters} />
          <GreenPlusButton
            onClick={() => {
              setCreateOpen(!isCreateOpen);
              setNewFlagError("");
            }}
            text="Create new flag"
          ></GreenPlusButton>
        </div>
        {isCreateOpen && (
          <div className="flex items-center justify-between flex-wrap font-semibold text-gray-600 border-b-4 py-2 px-3">
            <div className="flex flex-col items-end">
              <label htmlFor="newFlagName" className="m-2 flex-1">
                New flag name
                <input
                  id="newFlagName"
                  name="newFlagName"
                  type="text"
                  className="ml-2 border rounded p-2 w-auto focus:ring-0 focus:border-current"
                  defaultValue={newFlagName}
                  onChange={(e) => {
                    setNewFlagError("");
                    setNewFlagName(e.target.value);
                  }}
                />
              </label>
              <LocalError error={newFlagError} />
            </div>
            <YesNo
              question={`Create new flag '${newFlagName}'?`}
              onYes={() => {}}
              isOpen={createFlagYNOpen}
              hide={() => {
                setCreateFlagYNOpen(false);
              }}
            >
              <div className="flex items-center justify-between">
                <GreenPlusButton onClick={onCreate} text="Create" />
                <CancelButton
                  onClick={() => {
                    setCreateOpen(false);
                    setNewFlagError("");
                  }}
                  text="Cancel"
                />
              </div>
            </YesNo>
          </div>
        )}
      </div>
      <ul className="flex flex-col w-full h-full">{FlagListItems(flags)}</ul>
    </div>
  );
}
