import { useState } from "react";
import CancelButton from "../cancelButton";
import GreenPlusButton from "../greenPlusButton";
import LocalError from "../localError";
import YesNo from "../yesno";

export default function CreateFlagPanel(props: { setCreateOpen: Function }) {
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
    <div className="flex items-center justify-between flex-wrap font-semibold text-gray-600 border-b-4 py-2 px-3">
      <div className="flex flex-col items-end">
        <label htmlFor="newFlagName" className="m-2 flex-1">
          New flag name
          <input
            id="newFlagName"
            name="newFlagName"
            type="text"
            className="ml-2 border-2 rounded p-2 w-auto focus:ring-0 focus:border-current"
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
              props.setCreateOpen(false);
              setNewFlagError("");
            }}
            text="Cancel"
          />
        </div>
      </YesNo>
    </div>
  );
}
