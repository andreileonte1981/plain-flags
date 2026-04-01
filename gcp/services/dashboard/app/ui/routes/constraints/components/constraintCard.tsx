import { useContext, useState } from "react";
import { Link, useRevalidator } from "react-router";
import type { Constraint } from "~/client/api-client";
import { getApiClient } from "~/client/api-client";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { ToastContext } from "~/context/toastContext";
import { extractErrorMessage } from "~/utils/errorMessage";
import { scrollToElement } from "~/utils/scrollTo";
import TrashIcon from "~/ui/icons/trashIcon";
import EditIcon from "~/ui/icons/editIcon";
import SaveIcon from "~/ui/icons/saveIcon";
import CancelIcon from "~/ui/icons/cancelIcon";
import HandIcon from "~/ui/icons/handIcon";
import LinkIcon from "~/ui/icons/linkIcon";

export default function ConstraintCard({
  constraint,
}: {
  constraint: Constraint;
}) {
  const cardId = `constraintcard_${constraint.id}`;

  const { currentConstraint, setCurrentConstraint } = useContext(
    CurrentConstraintContext,
  );
  const { queueToast } = useContext(ToastContext);
  const revalidator = useRevalidator();

  const isCurrent = currentConstraint === constraint.id;

  // Edit state
  const [editing, setEditing] = useState(false);
  const [valuesInput, setValuesInput] = useState(constraint.values.join(",\n"));
  const [valuesError, setValuesError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function mayDelete(): boolean {
    return !constraint.flags.some((f) => f.isOn);
  }

  function checkValuesValid(): boolean {
    if (valuesInput.split(",").some((v) => v.trim() === "")) {
      setValuesError("Values may not be empty");
      return false;
    }
    return true;
  }

  async function handleSaveValues() {
    if (!checkValuesValid()) return;
    setSaveLoading(true);
    setSaveError("");
    try {
      await getApiClient().updateConstraintValues(constraint.id, valuesInput);
      await revalidator.revalidate();
      setEditing(false);
    } catch (err) {
      setSaveError(extractErrorMessage(err, "Failed to save values"));
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await getApiClient().deleteConstraint(constraint.id);
      queueToast("Constraint deleted.");
      await revalidator.revalidate();
    } catch (err) {
      setDeleteError(extractErrorMessage(err, "Failed to delete constraint"));
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  }

  const borderClass = isCurrent
    ? "border-4 border-magenta/50 shadow-lg"
    : "border-4 border-magenta/15 bg-gray-200/25";

  return (
    <div
      id={cardId}
      className={`rounded-lg mx-2 mb-4 p-2 text-gray-500 font-semibold scroll-mt-32 ${borderClass}`}
      onClick={() => {
        setCurrentConstraint(constraint.id);
        scrollToElement(cardId);
      }}
    >
      {/* Header row */}
      <div className="flex justify-between my-2 pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="md:block hidden">
            <HandIcon />
          </div>
          <div className="break-all font-bold text-gray-700">
            {constraint.description}
          </div>
        </div>
        <div className="break-all text-xs text-gray-400">
          id: {constraint.id}
        </div>
      </div>

      {/* Body */}
      <div className="break-all flex flex-wrap justify-between">
        <div>
          {/* Key */}
          <div className="my-2">
            For:{" "}
            <span className="font-bold text-gray-700">{constraint.key}</span>
          </div>

          {/* Values */}
          <span className="text-gray-500">Named:</span>

          {editing ? (
            <div className="flex flex-wrap items-start gap-2 mt-1">
              <div className="flex flex-col">
                <textarea
                  className="border-2 rounded p-1 md:min-w-64 min-h-20 focus:ring-0 focus:border-current placeholder-gray-300 md:resize"
                  defaultValue={valuesInput}
                  placeholder="Comma separated values required"
                  spellCheck={false}
                  autoFocus
                  onChange={(e) => {
                    setValuesInput(e.target.value);
                    setValuesError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditing(false);
                  }}
                />
                {valuesError && (
                  <p className="text-red-500 text-xs mt-1">{valuesError}</p>
                )}
                {saveError && (
                  <p className="text-red-500 text-xs mt-1">{saveError}</p>
                )}
              </div>

              {saveLoading ? (
                <div className="animate-bounce text-sm">Saving...</div>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <button
                    className="border-2 border-gray-500 rounded p-1 font-bold hover:bg-gray-600 hover:text-white active:scale-95"
                    title="Cancel"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(false);
                      setValuesError("");
                      setValuesInput(constraint.values.join(",\n"));
                    }}
                  >
                    <CancelIcon />
                  </button>
                  <button
                    className="border-2 border-gray-500 rounded p-1 font-bold hover:bg-gray-600 hover:text-white active:scale-95"
                    title="Save"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveValues();
                    }}
                  >
                    <SaveIcon />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-8 bg-gray-500/5 rounded p-2 mt-1">
              <div className="break-all">
                <div className="flex flex-col text-gray-700">
                  {constraint.values.map((v, i) => (
                    <p key={`${constraint.id}_val_${i}`}>{v}</p>
                  ))}
                </div>
              </div>
              <button
                className="border-2 border-gray-500 rounded p-1 font-bold bg-white hover:bg-gray-600 hover:text-white active:scale-95"
                title="Edit values"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
              >
                <EditIcon />
              </button>
            </div>
          )}
        </div>

        {/* Delete button column */}
        <div className="flex flex-col items-end gap-4">
          {mayDelete() ? (
            <>
              {deleteConfirm ? (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-xs text-gray-600 font-semibold">
                      Delete?
                    </span>
                    <button
                      className="text-xs px-2 py-1 rounded text-white bg-red-600 hover:bg-red-500 font-medium disabled:opacity-50"
                      disabled={deleteLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                    >
                      {deleteLoading ? "…" : "Yes"}
                    </button>
                    <button
                      className="text-xs text-gray-500 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(false);
                      }}
                    >
                      No
                    </button>
                  </div>
                  {deleteError && (
                    <p className="text-red-500 text-xs">{deleteError}</p>
                  )}
                </div>
              ) : (
                <button
                  className="border-2 border-gray-500 rounded p-1 font-bold hover:bg-gray-600 hover:text-white active:scale-95"
                  title="Delete constraint"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(true);
                  }}
                >
                  <TrashIcon />
                </button>
              )}
            </>
          ) : (
            <div className="relative group border-2 border-gray-200 text-gray-200 rounded p-1 font-bold cursor-not-allowed">
              <TrashIcon />
              <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-2 m-1 bg-black/90 rounded top-full -left-64 text-white text-sm font-bold z-10">
                Constrains active flags, can&apos;t delete.
                <br />
                Unlink constraint from flag first.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Linked flags */}
      {constraint.flags.length > 0 && (
        <div className="bg-gray-500/5 shadow-inner rounded p-2 mt-2">
          <div className="m-2">Flags constrained:</div>
          <ul>
            {constraint.flags.map((f) => (
              <li
                key={f.id}
                className={`m-2 ${f.isOn ? "text-green-700" : "text-gray-600"}`}
              >
                <Link
                  className="relative group inline-flex flex-wrap items-center gap-1 hover:text-green-600"
                  to={`/flags/${f.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkIcon />
                  <div className="break-all group-hover:underline">
                    {f.name}
                  </div>
                  {f.isOn && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      on
                    </span>
                  )}
                  {!f.isOn && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      off
                    </span>
                  )}
                  <div className="absolute invisible group-hover:visible transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-2 bg-black/90 rounded top-full text-white text-sm font-bold z-10">
                    Flag details
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
