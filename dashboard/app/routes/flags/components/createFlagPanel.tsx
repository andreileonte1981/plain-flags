import { useContext, useState } from "react";
import { ModalContext } from "~/context/modalContext";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import LocalError from "~/components/reusables/localError";
import YesNo from "~/components/reusables/yesno";
import GreenPlusButton from "~/components/reusables/greenPlusButton";
import CancelButton from "~/components/reusables/cancelButton";

export default function CreateFlagPanel(props: { setCreateOpen: Function }) {
  const [newFlagName, setNewFlagName] = useState("");

  const [createFlagYNOpen, setCreateFlagYNOpen] = useState(false);

  const [newFlagError, setNewFlagError] = useState("");

  const revalidator = useRevalidator();

  function onCreate() {
    if (!newFlagName) {
      setNewFlagError("New flag name required");
      return;
    }
    setCreateFlagYNOpen(true);
  }
  const { showMessage } = useContext(ModalContext);

  const onCreateYes = async () => {
    try {
      const response = await Client.post("flags", { name: newFlagName });

      showMessage("Flag created.");

      await revalidator.revalidate();

      setTimeout(() => {
        const id = `flagcard_${response.data.id}`;
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });
        }
      }, 100);
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Flag creation error");
    }
  };

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
        onYes={() => {
          onCreateYes();
        }}
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
