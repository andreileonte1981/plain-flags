import { useContext, useState } from "react";
import { ModalContext } from "~/context/modalContext";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import LocalError from "~/components/reusables/localError";
import YesNo from "~/components/reusables/yesno";
import GreenPlusButton from "~/components/reusables/greenPlusButton";
import CancelButton from "~/components/reusables/cancelButton";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import scrollToFlag from "../scrollToFlag";

export default function CreateFlagPanel(props: { setCreateOpen: Function }) {
  const [newFlagName, setNewFlagName] = useState("");

  const [ynOpen, setYNOpen] = useState(false);

  const [newFlagError, setNewFlagError] = useState("");

  const revalidator = useRevalidator();

  function onCreate() {
    if (!newFlagName) {
      setNewFlagError("New flag name required");
      return;
    }
    setYNOpen(true);
  }
  const { showMessage } = useContext(ModalContext);

  const { currentFlag, setCurrentFlag } = useContext(CurrentFlagContext);

  const onCreateYes = async () => {
    try {
      const response = await Client.post("flags", { name: newFlagName });

      showMessage("Flag created.");

      await revalidator.revalidate();

      setTimeout(() => {
        setCurrentFlag(`flagcard_${response.data.id}`);
        scrollToFlag(response.data.id);
        props.setCreateOpen(false);
      }, 100);
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Flag creation error");
    }
  };

  return (
    <div className="flex items-center justify-between flex-wrap font-semibold text-gray-600 border-b-4 py-2 px-3">
      <div className="flex flex-col items-end m-2">
        <label htmlFor="newFlagName" className="flex items-center gap-1 flex-1">
          New flag name
          <div>
            <input
              id="newFlagName"
              name="newFlagName"
              type="text"
              className="border-2 rounded p-2 w-auto focus:ring-0 focus:border-current"
              defaultValue={newFlagName}
              onChange={(e) => {
                setNewFlagError("");
                setNewFlagName(e.target.value);
              }}
            />
            <LocalError error={newFlagError} />
          </div>
        </label>
      </div>

      <YesNo
        question={`Create new flag '${newFlagName}'?`}
        onYes={() => {
          onCreateYes();
        }}
        isOpen={ynOpen}
        hide={() => {
          setYNOpen(false);
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
