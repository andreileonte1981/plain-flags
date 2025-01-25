import { useContext, useState } from "react";
import { ModalContext } from "~/context/modalContext";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import YesNo from "~/components/reusables/yesno";
import GreenPlusButton from "~/components/reusables/greenPlusButton";
import CancelButton from "~/components/reusables/cancelButton";
import LocalError from "~/components/reusables/localError";

export default function CreateConstraintPanel(props: {
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

  const [ynOpen, setYNOpen] = useState(false);

  const revalidator = useRevalidator();

  const { showMessage } = useContext(ModalContext);

  const onCreateYes = async () => {
    try {
      const response = await Client.post("constraints", {
        description: formData.description,
        key: formData.key,
        commaSeparatedValues: formData.commaSeparatedValues,
      });

      showMessage("Constraint created.");

      await revalidator.revalidate();

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
    <div className="flex items-center justify-between flex-wrap font-semibold text-gray-600 border-b-4 py-2 px-3">
      <div className="flex flex-col items-end">
        <label htmlFor="newConstraintDescription" className="m-2 flex-1">
          Constraint description
          <input
            id="newConstraintDescription"
            name="newConstraintDescription"
            type="text"
            className="ml-2 border-2 rounded p-2 w-auto focus:ring-0 focus:border-current"
            defaultValue={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              setError({ ...error, description: "" });
            }}
          />
          <LocalError error={error.description} />
        </label>
        <label htmlFor="newConstraintKey" className="m-2 flex-1">
          What it's for (e.g. <span className="font-bold">user_id</span>)
          <input
            id="newConstraintKey"
            name="newConstraintKey"
            type="text"
            className="ml-2 border-2 rounded p-2 w-auto focus:ring-0 focus:border-current"
            defaultValue={formData.key}
            onChange={(e) => {
              setFormData({ ...formData, key: e.target.value });
              setError({ ...error, key: "" });
            }}
          />
          <LocalError error={error.key} />
        </label>
        <label htmlFor="newConstraintValues" className="m-2 flex-1">
          <div>
            Who/which it's for (e.g.{" "}
            <span className="font-bold">Steve, John, Pete</span>) - comma
            separated
          </div>
          <input
            id="newConstraintValues"
            name="newConstraintValues"
            type="text"
            className="ml-2 border-2 rounded p-2 w-auto focus:ring-0 focus:border-current"
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
        </label>
      </div>

      <YesNo
        question={`Create new constraint '${formData.description}'?`}
        onYes={() => {
          onCreateYes();
        }}
        isOpen={ynOpen}
        hide={() => {
          setYNOpen(false);
        }}
      >
        <div className="flex items-center justify-between">
          <GreenPlusButton
            onClick={() => {
              if (checkValid()) {
                setYNOpen(true);
              }
            }}
            text="Create"
          />
          <CancelButton
            onClick={() => {
              props.setCreateOpen(false);
            }}
            text="Cancel"
          />
        </div>
      </YesNo>
    </div>
  );
}
