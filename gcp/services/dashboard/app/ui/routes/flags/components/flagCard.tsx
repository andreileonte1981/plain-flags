import { useContext, useState } from "react";
import { useNavigate, useRevalidator } from "react-router";
import type { Flag } from "~/client/api-client";
import { getApiClient } from "~/client/api-client";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import { ToastContext } from "~/context/toastContext";

interface FlagCardProps {
  flag: Flag;
}

export default function FlagCard({ flag }: FlagCardProps) {
  const flagCardId = `flagcard_${flag.id}`;
  const { currentFlag, setCurrentFlag } = useContext(CurrentFlagContext);
  const { queueToast } = useContext(ToastContext);
  const navigate = useNavigate();
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

  function handleCardClick() {
    setCurrentFlag(flagCardId);
    navigate(`/flags/${flag.id}`);
  }

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
      onClick={handleCardClick}
      className={`bg-white rounded-lg border-l-4 border-l-green-500 scroll-mt-32 transition-shadow cursor-pointer ${borderClassName}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{flag.name}</h3>
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
    </div>
  );
}
