import type { Flag } from "~/domain/flag";
import FlagListItems from "./flagListItems";
import { useState } from "react";
import FlagFilters from "./flagFilters";
import GreenPlusButton from "../greenPlusButton";
import CancelButton from "../cancelButton";
import YesNo from "../yesno";

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
            }}
            text="Create new flag"
          ></GreenPlusButton>
        </div>
        {isCreateOpen && (
          <div className="flex items-center flex-wrap font-semibold text-gray-600 border-b-4 py-2 px-3">
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
              {newFlagError && (
                <div className="w-full rounded p-2 mx-2 text-center bg-red-300/30 text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6 inline-block mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                    />
                  </svg>
                  {newFlagError}
                </div>
              )}
            </div>
            <YesNo
              question={`Create new flag '${newFlagName}'?`}
              onYes={() => {}}
              isOpen={createFlagYNOpen}
              hide={() => {
                setCreateFlagYNOpen(false);
              }}
            >
              <GreenPlusButton onClick={onCreate} text="Create" />
            </YesNo>

            <CancelButton
              onClick={() => {
                setCreateOpen(false);
              }}
              text="Cancel"
            />
          </div>
        )}
      </div>
      <ul className="flex flex-col w-full h-full">{FlagListItems(flags)}</ul>
    </div>
  );
}
