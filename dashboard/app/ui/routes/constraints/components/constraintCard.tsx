import { useContext, useState } from "react";
import { Link, useRevalidator } from "react-router";
import Client from "~/client/client";
import FlagIcon from "~/ui/components/icons/flagIcon";
import FlagOutlineIcon from "~/ui/components/icons/flagOutlineIcon";
import HandIcon from "~/ui/components/icons/handIcon";
import LinkIcon from "~/ui/components/icons/linkIcon";
import TrashIcon from "~/ui/components/icons/trashIcon";
import Badge from "~/ui/components/reusables/badge";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { ModalContext } from "~/context/modalContext";
import type { Flag } from "~/domain/flag";
import YesNoWrap from "~/ui/components/reusables/yesnoWrap";
import { ToastContext } from "~/context/toastContext";
import { scrollToElement } from "~/utils/scrollTo";
import EditIcon from "~/ui/components/icons/editIcon";
import SaveIcon from "~/ui/components/icons/saveIcon";
import LocalError from "~/ui/components/reusables/localError";
import CancelIcon from "~/ui/components/icons/cancelIcon";

export default function ConstraintCard(props: {
  id: string;
  description: string;
  constraintkey: string;
  values: string[];
  flags: Flag[];
}) {
  const ynElementId = `yn${props.id}`;

  const [deleteWaitOpen, setDeleteWaitOpen] = useState(false);
  const [editWaitOpen, setEditWaitOpen] = useState(false);

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(props.values.join(",\n"));
  const [error, setError] = useState("");

  function checkValid(): boolean {
    // debugger;
    if (values.split(",").some((v) => v.trim() === "")) {
      setError("Values required");
      return false;
    }
    return true;
  }

  const { showMessage } = useContext(ModalContext);
  const { queueToast } = useContext(ToastContext);

  const revalidator = useRevalidator();

  async function saveValues() {
    try {
      setEditWaitOpen(true);
      await Client.post("constraints/values", {
        id: props.id,
        values,
      });

      setEditWaitOpen(false);

      revalidator.revalidate();

      setEditing(false);
    } catch (error: any) {
      setEditWaitOpen(false);

      showMessage(error.response?.data?.message || "Constraint edit error");
    }
  }

  async function deleteConstraint() {
    try {
      setDeleteWaitOpen(true);

      await Client.post("constraints/delete", {
        id: props.id,
      });

      setDeleteWaitOpen(false);

      revalidator.revalidate();

      queueToast("Constraint deleted.");
    } catch (error: any) {
      // debugger;
      setDeleteWaitOpen(false);

      showMessage(error.response?.data?.message || "Constraint deletion error");
    }
  }

  function mayDelete(): boolean {
    return !props.flags.some((f) => f.isOn);
  }

  const { currentConstraint, setCurrentConstraint } = useContext(
    CurrentConstraintContext
  );

  const className = `border-4 rounded-lg mx-2 mb-4 p-2 text-gray-500 font-semibold ${
    currentConstraint === props.id
      ? "border-magenta/50 shadow-lg"
      : "border-magenta/15 bg-gray-200/25"
  }`;

  return (
    <div
      id={`constraintcard_${props.id}`}
      className={className}
      onClick={() => {
        setCurrentConstraint(props.id);
        scrollToElement(`constraintcard_${props.id}`);
      }}
    >
      <div className="flex justify-between my-2 pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="md:block hidden">
            <HandIcon />
          </div>
          <div className="break-all font-bold text-gray-700">
            {props.description}
          </div>
        </div>
        <div className="break-all text-xs text-gray-400">id: {props.id}</div>
      </div>

      <div className="break-all flex flex-wrap justify-between">
        <div>
          <div className="my-2">
            For:{" "}
            <span className="font-bold text-gray-700">
              {props.constraintkey}
            </span>
          </div>

          <span className="text-gray-500">Named:</span>

          {editing ? (
            <div className="flex flex-wrap items-start">
              <div className="flex flex-col mx-1">
                <textarea
                  id="newConstraintValues"
                  name="newConstraintValues"
                  className="border-2 rounded p-1 md:min-w-64 min-h-20 focus:ring-0 focus:border-current placeholder-gray-300 md:resize"
                  defaultValue={values}
                  placeholder="Comma separated values required"
                  spellCheck={false}
                  autoFocus
                  onChange={(e) => {
                    setValues(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setEditing(false);
                    }
                  }}
                />
                <LocalError error={error} />
              </div>

              <YesNoWrap
                clickId={`ynSave_${props.id}`}
                question={`Save values?`}
                hint={
                  props.flags.length
                    ? "Value changes are recorded in flag history"
                    : undefined
                }
                onYes={async () => {
                  await saveValues();
                }}
                preDialogValidator={checkValid}
                key={values}
                id="ynEdit"
              >
                {editWaitOpen ? (
                  <div className="animate-bounce">Saving...</div>
                ) : (
                  <div
                    id="editbuttons"
                    className="flex flex-col items-start gap-2"
                  >
                    <div
                      id="canceledit"
                      className="border-2 border-gray-500 rounded p-1 font-bold hover:bg-gray-600 hover:text-white active:scale-95"
                      onClick={() => {
                        setEditing(false);
                        setError("");
                        setValues(props.values.join(",\n"));
                      }}
                    >
                      <CancelIcon />
                    </div>
                    <div>
                      <button
                        id={`ynSave_${props.id}`}
                        className="border-2 border-gray-500 rounded p-1 font-bold hover:bg-gray-600 hover:text-white active:scale-95"
                      >
                        <SaveIcon />
                      </button>
                    </div>
                  </div>
                )}
              </YesNoWrap>
            </div>
          ) : (
            <div
              id="valuesreadonly"
              className="flex flex-wrap items-start gap-8 bg-gray-500/5 rounded p-2"
            >
              <div className="break-all">
                <div className="flex flex-col text-gray-700">
                  {props.values.map((v, index) => (
                    <p key={`${props.id}_val_${index}`}>{v}</p>
                  ))}
                </div>
              </div>
              <button
                className="border-2 border-gray-500 rounded p-1 font-bold bg-white hover:bg-gray-600 hover:text-white active:scale-95"
                onClick={() => setEditing(true)}
              >
                <EditIcon />
              </button>
            </div>
          )}
        </div>

        <div id="rightbuttons" className="flex flex-col items-end gap-4">
          <YesNoWrap
            clickId={`ynDeleteConstraint_${props.id}`}
            question={`Delete constraint?`}
            onYes={() => {
              deleteConstraint();
            }}
            id={ynElementId}
          >
            {mayDelete() ? (
              <>
                {deleteWaitOpen && (
                  <div className="animate-bounce">Deleting...</div>
                )}
                {!deleteWaitOpen && (
                  <div
                    className="border-2 border-gray-500 rounded p-1 font-bold hover:bg-gray-600 hover:text-white active:scale-95"
                    id={`ynDeleteConstraint_${props.id}`}
                  >
                    <TrashIcon />
                  </div>
                )}
              </>
            ) : (
              <div className="relative group border-2 border-gray-200 text-gray-200 rounded p-1 font-bold cursor-not-allowed">
                <TrashIcon />

                <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-2 m-1 bg-black/90 rounded top-full -left-64 text-white text-sm font-bold">
                  Constrains active flags, can't delete.
                  <br />
                  Unlink constraint from flag first
                </div>
              </div>
            )}
          </YesNoWrap>
        </div>
      </div>

      {props.flags.length > 0 && (
        <div className="bg-gray-500/5 shadow-inner rounded p-2 mt-2">
          <div className="m-2">Flags constrained:</div>

          <ul>
            {props.flags.map((f) => {
              const cn = `m-2 ${f.isOn ? "text-green-700" : "text-gray-600"}`;
              return (
                <li key={f.id} className={cn}>
                  <Link
                    className="relative group inline-flex flex-wrap items-center gap-1 hover:text-green-600"
                    to={`/flags/${f.id}`}
                  >
                    <LinkIcon />
                    <div className="break-all group-hover:underline">
                      {f.name}
                    </div>
                    {f.isOn && (
                      <Badge text="on" color="green" tooltip="">
                        <FlagIcon />
                      </Badge>
                    )}

                    {!f.isOn && (
                      <Badge text="off" color="gray" tooltip="">
                        <FlagOutlineIcon />
                      </Badge>
                    )}
                    <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-2 bg-black/90 rounded top-full text-white text-sm font-bold z-5">
                      Flag details
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
