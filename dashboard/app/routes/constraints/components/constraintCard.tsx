import { useContext, useState } from "react";
import { useRevalidator } from "react-router";
import Client from "~/client/client";
import TrashIcon from "~/components/icons/trashIcon";
import YesNo from "~/components/reusables/yesno";
import { ModalContext } from "~/context/modalContext";

export default function ConstraintCard(props: {
  id: string;
  description: string;
  constraintkey: string;
  values: string[];
  flags: string[];
}) {
  const [deleteYNOpen, setDeleteYNOpen] = useState(false);
  const ynElementId = `yn${props.id}`;

  const [deleteWaitOpen, setDeleteWaitOpen] = useState(false);

  const { showMessage } = useContext(ModalContext);

  const revalidator = useRevalidator();

  async function deleteConstraint() {
    try {
      setDeleteWaitOpen(true);

      await Client.post("constraints/delete", {
        id: props.id,
      });

      setDeleteWaitOpen(false);

      revalidator.revalidate();

      showMessage("Constraint deleted.");
    } catch (error: any) {
      // debugger;
      setDeleteWaitOpen(false);

      showMessage(error.response?.data?.message || "Constraint deletion error");
    }
  }

  return (
    <div
      id={`constraintcard_${props.id}`}
      className="border-2 rounded border-gray-300 m-2 p-2 text-gray-500 font-semibold"
    >
      <div className="flex justify-between my-2 border-b">
        <div className="font-bold text-gray-700">{props.description}</div>
        <div className="text-xs text-gray-400">id: {props.id}</div>
      </div>

      <div className="flex justify-between">
        <div>
          <div className="my-2">
            For:{" "}
            <span className="font-bold text-gray-700">
              {props.constraintkey}
            </span>
          </div>

          <div>
            Named:{" "}
            <span className="font-bold text-gray-700">
              {props.values.join(", ")}
            </span>
          </div>
        </div>

        <YesNo
          question={`Delete constraint?`}
          onYes={() => {
            deleteConstraint();
          }}
          isOpen={deleteYNOpen}
          hide={() => {
            setDeleteYNOpen(false);
          }}
          id={ynElementId}
        >
          {deleteWaitOpen && <div>Deleting...</div>}
          {!deleteWaitOpen && (
            <div
              className="border-2 border-gray-500 rounded p-1 -my-3 font-bold hover:bg-gray-600 hover:text-white active:scale-95"
              onClick={() => {
                setDeleteYNOpen(true);

                setTimeout(() => {
                  const element = document.getElementById(ynElementId);
                  if (element) {
                    element.scrollIntoView({
                      block: "nearest",
                      behavior: "smooth",
                    });
                  }
                }, 0);
              }}
            >
              <TrashIcon />
            </div>
          )}
        </YesNo>
      </div>

      {props.flags.length > 0 && (
        <div className="border-2 border-purple-200 rounded p-2 mt-2">
          <div className="m-2">Flags constrained:</div>

          <ul>
            {props.flags.map((f) => (
              <li key={f} className="m-2">
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
