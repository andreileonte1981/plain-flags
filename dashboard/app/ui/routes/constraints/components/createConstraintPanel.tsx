import { useContext, useState } from "react";
import { ModalContext } from "~/context/modalContext";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import GreenPlusButton from "~/ui/components/reusables/greenPlusButton";
import CancelButton from "~/ui/components/reusables/cancelButton";
import LocalError from "~/ui/components/reusables/localError";
import { AnimatePresence, motion } from "motion/react";
import { slideDownVariants } from "~/ui/animations/variants";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";
import { ToastContext } from "~/context/toastContext";

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

  const onCreateYes = async () => {
    try {
      const response = await Client.post("constraints", {
        description: formData.description,
        key: formData.key,
        commaSeparatedValues: formData.commaSeparatedValues,
      });

      queueToast("Constraint created.");

      await revalidator.revalidate();

      props.setCreateOpen(false);

      setTimeout(() => {
        const id = `constraintcard_${response.data.id}`;
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
          <div className="flex items-center justify-between flex-wrap font-semibold text-gray-600 border-b-4 py-2 px-3">
            <div className="flex flex-col items-end">
              <label
                htmlFor="newConstraintDescription"
                className="flex justify-end items-center m-1 flex-1 text-end"
              >
                <p className="mr-2">
                  Constraint description
                  <br />
                  <span className="text-sm text-gray-500">
                    (e.g. 'Test Users')
                  </span>
                </p>
                <div className="flex flex-col items-end">
                  <input
                    id="newConstraintDescription"
                    name="newConstraintDescription"
                    type="text"
                    className="border-2 rounded p-1 w-auto focus:ring-0 focus:border-current"
                    defaultValue={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setError({ ...error, description: "" });
                    }}
                  />
                  <LocalError error={error.description} />
                </div>
              </label>
              <label
                htmlFor="newConstraintKey"
                className="flex justify-end items-center m-1 flex-1 text-end"
              >
                <p className="mr-2">
                  What it's for
                  <br />
                  <span className="text-sm text-gray-500">
                    (e.g. <span className="font-bold">'user_id'</span>)
                  </span>
                </p>
                <div className="flex flex-col items-end">
                  <input
                    id="newConstraintKey"
                    name="newConstraintKey"
                    type="text"
                    className="border-2 rounded p-1 w-auto focus:ring-0 focus:border-current"
                    defaultValue={formData.key}
                    onChange={(e) => {
                      setFormData({ ...formData, key: e.target.value });
                      setError({ ...error, key: "" });
                    }}
                  />
                  <LocalError error={error.key} />
                </div>
              </label>
              <label
                htmlFor="newConstraintValues"
                className="flex justify-end items-center m-1 flex-1 text-end"
              >
                <div>
                  <p className="mr-2">
                    Who/which it's for
                    <br />
                    <span className="text-sm text-gray-500">
                      (e.g.{" "}
                      <span className="font-bold">'Steve, John, Pete'</span>)
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <input
                    id="newConstraintValues"
                    name="newConstraintValues"
                    type="text"
                    className="border-2 rounded p-1 w-auto focus:ring-0 focus:border-current"
                    defaultValue={formData.commaSeparatedValues}
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
              </label>
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
                <GreenPlusButton
                  id="ynCreateConstraint"
                  text="Create"
                  onClick={() => {}}
                />
                <CancelButton
                  onClick={() => {
                    props.setCreateOpen(false);
                  }}
                  text="Cancel"
                />
              </div>
            </YesNoWrap>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
