import { useContext, useState } from "react";
import { Link, useRevalidator } from "react-router";
import type { Flag } from "~/client/api-client";
import { getApiClient } from "~/client/api-client";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { ToastContext } from "~/context/toastContext";
import HandIcon from "~/ui/icons/handIcon";
import LinkIcon from "~/ui/icons/linkIcon";

interface FlagCardProps {
  flag: Flag;
}

export default function FlagCard({ flag }: FlagCardProps) {
  const flagCardId = `flagcard_${flag.id}`;
  const { currentFlag, setCurrentFlag } = useContext(CurrentFlagContext);
  const { setCurrentConstraint } = useContext(CurrentConstraintContext);
  const { queueToast } = useContext(ToastContext);
  const revalidator = useRevalidator();
  const isCurrent = currentFlag === flagCardId;

  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveError, setArchiveError] = useState("");

  const statusClassName = flag.isOn
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-800";

  const borderClassName = isCurrent
    ? "border-4 border-green-600 shadow-lg"
    : "border border-gray-200 shadow hover:shadow-md";

  async function archive(e: React.MouseEvent) {
    e.stopPropagation();
    setArchiveLoading(true);
    setArchiveError("");
    try {
      await getApiClient().archiveFlag(flag.id);
      queueToast("Flag archived.");
      await revalidator.revalidate();
    } catch (err: any) {
      setArchiveError(
        err?.response?.data?.message || err.message || "Error archiving flag",
      );
      setArchiveLoading(false);
    }
  }

  function renderArchiveSection() {
    if (flag.isArchived) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          Archived
        </span>
      );
    }

    if (flag.isOn) {
      return (
        <button
          disabled
          title="Turn the flag off before archiving"
          className="text-xs px-2 py-1 rounded text-white bg-orange-200 cursor-not-allowed font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          Archive
        </button>
      );
    }

    if (archiveConfirm) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex gap-1.5 items-center">
            <span className="text-xs text-gray-600 font-semibold">
              Archive?
            </span>
            <button
              className="text-xs px-2 py-1 rounded text-white bg-orange-600 hover:bg-orange-500 font-medium disabled:opacity-50"
              disabled={archiveLoading}
              onClick={archive}
            >
              {archiveLoading ? "…" : "Yes"}
            </button>
            <button
              className="text-xs text-gray-500 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setArchiveConfirm(false);
              }}
            >
              No
            </button>
          </div>
          {archiveError && (
            <p className="text-red-500 text-xs">{archiveError}</p>
          )}
        </div>
      );
    }

    return (
      <button
        className="text-xs px-2 py-1 rounded text-white bg-orange-600 hover:bg-orange-500 font-medium"
        onClick={(e) => {
          e.stopPropagation();
          setArchiveConfirm(true);
        }}
      >
        Archive
      </button>
    );
  }

  return (
    <div
      id={flagCardId}
      onClick={() => setCurrentFlag(flagCardId)}
      className={`bg-white rounded-lg border-l-4 border-l-green-500 scroll-mt-32 transition-shadow ${borderClassName}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Link
            to={`/flags/${flag.id}`}
            onClick={() => setCurrentFlag(flagCardId)}
            className="group inline-flex items-center gap-1 text-lg font-medium text-gray-900 hover:underline"
          >
            {flag.name}
            <span className="text-gray-400">
              <LinkIcon />
            </span>
          </Link>
          <div className="flex gap-1.5 items-center">
            {flag.stale && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                STALE
              </span>
            )}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClassName}`}
            >
              {flag.isOn ? "ON" : "OFF"}
            </span>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">ID: {flag.id}</p>
          <p className="text-sm text-gray-500">
            Created: {new Date(flag.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div
        className="px-6 pb-4 pt-3 border-t border-gray-100 flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {renderArchiveSection()}
      </div>

      {flag.constraints && flag.constraints.length > 0 && (
        <div className="px-6 pb-4" onClick={(e) => e.stopPropagation()}>
          <ul className="border-2 rounded border-magenta/15 p-2 space-y-2">
            {flag.constraints.map((constraint, index) => (
              <li
                key={constraint.id}
                className="first:border-none border-t-2 border-magenta/15 pt-1 first:pt-0"
              >
                <Link
                  to="/constraints"
                  onClick={() => {
                    setCurrentFlag(flagCardId);
                    setCurrentConstraint(constraint.id);
                  }}
                  className="break-all inline-flex items-center gap-1 mb-1 text-purple-700 hover:underline font-semibold"
                >
                  <HandIcon />
                  <span>{constraint.description}</span>
                </Link>
                <p className="text-sm text-gray-600">
                  For:{" "}
                  <span className="font-bold text-gray-700">
                    {constraint.key}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Named:{" "}
                  <span className="font-bold text-gray-700">
                    {constraint.values.join(", ")}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
