import { useContext, useState } from "react";
import { ModalContext } from "~/context/modalContext";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import LocalError from "~/ui/components/reusables/localError";
import YesNo from "~/ui/components/reusables/yesno";
import GreenPlusButton from "~/ui/components/reusables/greenPlusButton";
import CancelButton from "~/ui/components/reusables/cancelButton";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import scrollToElement from "../../../../utils/scrollToElement";
import { AnimatePresence, motion } from "motion/react";
import { slideDownVariants } from "~/ui/animations/variants";

export default function CreateFlagPanel(props: {
  isCreateOpen: boolean;
  setCreateOpen: Function;
}) {
  const [newFlagName, setNewFlagName] = useState("");

  const [ynOpen, setYNOpen] = useState(false);

  const [newFlagError, setNewFlagError] = useState("");

  const revalidator = useRevalidator();

  function onPressCreate() {
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

      props.setCreateOpen(false);

      setTimeout(() => {
        setCurrentFlag(`flagcard_${response.data.id}`);
        scrollToElement(`flagcard_${response.data.id}`);
      }, 200);
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Flag creation error");
    }
  };

  return (
    <AnimatePresence>
      {props.isCreateOpen && (
        <motion.div
          variants={slideDownVariants}
          initial="hidden"
          animate="shown"
          exit="hidden"
          transition={{ duration: 0.1, ease: "easeIn" }}
        >
          <div className="flex items-center justify-between flex-wrap font-semibold text-gray-600 px-3 border-b-4 py-2">
            <div className="flex flex-col items-end m-2">
              <label
                htmlFor="newFlagName"
                className="flex items-center gap-1 flex-1"
              >
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
                <GreenPlusButton onClick={onPressCreate} text="Create" />
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
