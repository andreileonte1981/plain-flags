import { redirect, useRevalidator, useNavigate } from "react-router";
import { Link } from "react-router";
import { useContext, useState } from "react";
import type { Flag } from "~/client/api-client";
import { getApiClient } from "~/client/api-client";
import { getFirebaseAuth } from "~/firebase";
import { ToastContext } from "~/context/toastContext";

export function meta() {
  return [
    { title: "Flag Details - Plain Flags" },
    { name: "description", content: "Turn your feature flag on or off" },
  ];
}

export async function clientLoader({
  params,
}: {
  params: Record<string, string>;
}) {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    return redirect("/login");
  }

  try {
    const flag = await getApiClient().getFlag(params.flagId as string);
    return { flag, error: null };
  } catch (error) {
    return {
      flag: null,
      error: error instanceof Error ? error.message : "Failed to load flag",
    };
  }
}

function StatusBadge({ isOn }: { isOn: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
        isOn ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
      }`}
    >
      {isOn ? "ON" : "OFF"}
    </span>
  );
}

function TurnOnOffButton({ flag }: { flag: Flag }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const revalidator = useRevalidator();
  const { queueToast } = useContext(ToastContext);

  async function toggle() {
    setLoading(true);
    setError("");
    try {
      if (flag.isOn) {
        await getApiClient().turnOffFlag(flag.id);
        queueToast("Flag turned off.");
      } else {
        await getApiClient().turnOnFlag(flag.id);
        queueToast("Flag turned on.");
      }
      setConfirm(false);
      revalidator.revalidate();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Error updating flag",
      );
    } finally {
      setLoading(false);
    }
  }

  if (confirm) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold text-gray-600">
            Turn {flag.isOn ? "off" : "on"}?
          </span>
          <button
            className={`font-bold text-sm px-3 py-1 rounded text-white ${
              flag.isOn
                ? "bg-red-600 hover:bg-red-500"
                : "bg-green-600 hover:bg-green-500"
            }`}
            disabled={loading}
            onClick={toggle}
          >
            {loading ? (flag.isOn ? "Turning off…" : "Turning on…") : "Yes"}
          </button>
          <button
            className="text-gray-500 text-sm hover:underline"
            onClick={() => setConfirm(false)}
          >
            No
          </button>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <button
      className={`font-bold text-sm px-4 py-2 rounded text-white ${
        flag.isOn
          ? "bg-red-600 hover:bg-red-500"
          : "bg-green-600 hover:bg-green-500"
      }`}
      onClick={() => setConfirm(true)}
    >
      Turn {flag.isOn ? "Off" : "On"}
    </button>
  );
}

function ArchiveButton({ flag }: { flag: Flag }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { queueToast } = useContext(ToastContext);

  async function archive() {
    setLoading(true);
    setError("");
    try {
      await getApiClient().archiveFlag(flag.id);
      queueToast("Flag archived.");
      navigate("/flags");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Error archiving flag",
      );
      setLoading(false);
    }
  }

  if (flag.isArchived) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
        Archived
      </span>
    );
  }

  if (flag.isOn) {
    return (
      <button
        disabled
        title="Turn the flag off before archiving"
        className="font-bold text-sm px-4 py-2 rounded text-white bg-orange-200 cursor-not-allowed"
      >
        Archive
      </button>
    );
  }

  if (confirm) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold text-gray-600">
            Archive flag?
          </span>
          <button
            className="font-bold text-sm px-3 py-1 rounded text-white bg-orange-600 hover:bg-orange-500"
            disabled={loading}
            onClick={archive}
          >
            {loading ? "Archiving…" : "Yes"}
          </button>
          <button
            className="text-gray-500 text-sm hover:underline"
            onClick={() => setConfirm(false)}
          >
            No
          </button>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <button
      className="font-bold text-sm px-4 py-2 rounded text-white bg-orange-600 hover:bg-orange-500"
      onClick={() => setConfirm(true)}
    >
      Archive
    </button>
  );
}

export default function FlagDetail({ loaderData }: { loaderData: any }) {
  const { flag, error } = loaderData as {
    flag: Flag | null;
    error: string | null;
  };

  if (error || !flag) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <p className="text-red-600">{error || "Flag not found"}</p>
        <Link
          to="/flags"
          className="text-sm text-red-500 hover:underline mt-2 inline-block"
        >
          ← Back to flags
        </Link>
      </div>
    );
  }

  return (
    <div className="text-gray-600 font-semibold">
      {/* Header bar */}
      <div className="sticky md:top-0 top-12 z-10 bg-white flex flex-wrap gap-x-0 justify-between items-center border-b-4 border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/flags"
            className="text-sm text-red-500 hover:underline flex items-center gap-1"
          >
            ← flags
          </Link>
          <span className="text-lg font-bold text-gray-900 break-all">
            {flag.name}
          </span>
          <StatusBadge isOn={flag.isOn} />
          {flag.stale && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
              STALE
            </span>
          )}
        </div>
        <div className="flex-none mt-2 sm:mt-0 flex gap-2 items-center">
          {!flag.isArchived && <TurnOnOffButton flag={flag} />}
          <ArchiveButton flag={flag} />
        </div>
      </div>

      {/* Details */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        <div className="bg-white shadow rounded-lg p-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">ID</span>
            <span className="font-mono text-gray-700 text-xs break-all text-right">
              {flag.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Created</span>
            <span>{new Date(flag.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Updated</span>
            <span>{new Date(flag.updatedAt).toLocaleString()}</span>
          </div>
          {flag.isArchived && (
            <div className="text-orange-600 font-medium pt-1">Archived</div>
          )}
        </div>
      </div>
    </div>
  );
}
