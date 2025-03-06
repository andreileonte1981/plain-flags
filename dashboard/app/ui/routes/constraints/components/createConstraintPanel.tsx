import { useContext, useState } from "react";
import { ModalContext } from "~/context/modalContext";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import CancelButton from "~/ui/components/reusables/cancelButton";
import LocalError from "~/ui/components/reusables/localError";
import { AnimatePresence, motion } from "motion/react";
import { slideDownVariants } from "~/ui/animations/variants";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";
import { ToastContext } from "~/context/toastContext";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { scrollToElement } from "~/utils/scrollTo";
import PurplePlusButton from "~/ui/components/reusables/purplePlusButton";

export default function CreateConstraintPanel(props: {
  isCreateOpen: boolean;
  setCreateOpen: Function;
}) {
  const [formData, setFormData] = useState({
    description: "",
    key: "",
    commaSeparatedValues: "",
  });

  const [error, setError] = useState({
    description: "",
    key: "",
    commaSeparatedValues: "",
  });

  const revalidator = useRevalidator();

  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);
  const { currentConstraint, setCurrentConstraint } = useContext(
    CurrentConstraintContext
  );

  const onCreateYes = async () => {
    try {
      const response = await Client.post("constraints", {
        description: formData.description,
        key: formData.key,
        commaSeparatedValues: formData.commaSeparatedValues,
      });

      queueToast("Constraint created.");

      await revalidator.revalidate();

      setTimeout(() => {
        setCurrentConstraint(response.data.id);
        scrollToElement(
          `constraintcard_${response.data.id}`,
          "smooth",
          "start"
        );
      }, 500);
    } catch (error: any) {
      // debugger;

      showMessage(error.response?.data?.message || "Constraint creation error");
    }
  };

  function checkValid(): boolean {
    setError((preverr) => ({
      description: "",
      key: "",
      commaSeparatedValues: "",
    }));

    let pass = true;

    if (formData.description === "") {
      setError((prevError) => ({
        ...prevError,
        description: "Field is required",
      }));
      pass = false;
    }

    if (formData.key === "") {
      setError((prevError) => ({
        ...prevError,
        key: "Field is required",
      }));
      pass = false;
    }

    if (formData.commaSeparatedValues === "") {
      setError((prevError) => ({
        ...prevError,
        commaSeparatedValues: "Field is required",
      }));
      pass = false;
    }

    if (!pass) {
      return false;
    }

    return true;
  }

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
          <div className="flex items-center gap-4 flex-wrap bg-purple-500/5 font-semibold text-gray-600 border-b-4 border-magenta/20 py-2 px-3">
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-col items-end gap-2 mx-1">
                <div className="flex flex-col items-end">
                  <input
                    id="newConstraintDescription"
                    name="newConstraintDescription"
                    type="text"
                    className="border-2 rounded p-1 w-auto focus:ring-0 focus:border-current placeholder-gray-300"
                    defaultValue={formData.description}
                    placeholder="Description"
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setError({ ...error, description: "" });
                    }}
                  />
                  <LocalError error={error.description} />
                </div>

                <div className="flex flex-col items-end">
                  <input
                    id="newConstraintKey"
                    name="newConstraintKey"
                    type="text"
                    className="border-2 rounded p-1 w-auto focus:ring-0 focus:border-current placeholder-gray-300"
                    defaultValue={formData.key}
                    placeholder="What it's for (e.g. userId)"
                    onChange={(e) => {
                      setFormData({ ...formData, key: e.target.value });
                      setError({ ...error, key: "" });
                    }}
                  />
                  <LocalError error={error.key} />
                </div>
              </div>
              <div className="flex flex-col items-end mx-1">
                <textarea
                  id="newConstraintValues"
                  name="newConstraintValues"
                  className="border-2 rounded p-1 min-w-64 h-full focus:ring-0 focus:border-current placeholder-gray-300 resize"
                  defaultValue={formData.commaSeparatedValues}
                  placeholder="Who / which it's for (comma separated)"
                  spellCheck={false}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      commaSeparatedValues: e.target.value,
                    });
                    setError({ ...error, commaSeparatedValues: "" });
                  }}
                />
                <LocalError error={error.commaSeparatedValues} />
              </div>
            </div>

            <YesNoWrap
              clickId="ynCreateConstraint"
              question={`Create new constraint '${formData.description}'?`}
              preDialogValidator={checkValid}
              key={Object.values(formData).join("|")}
              onYes={() => {
                onCreateYes();
              }}
            >
              <div className="flex items-center justify-between">
                <PurplePlusButton
                  id="ynCreateConstraint"
                  text="Create"
                  onClick={() => {}}
                />
                <CancelButton
                  onClick={() => {
                    props.setCreateOpen(false);
                  }}
                  text="Close"
                />
              </div>
            </YesNoWrap>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
