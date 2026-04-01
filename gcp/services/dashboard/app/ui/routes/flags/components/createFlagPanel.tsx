import { useContext, useState } from "react";
import { useRevalidator } from "react-router";
import { getApiClient } from "~/client/api-client";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import { scrollToElement } from "~/utils/scrollTo";
import { extractErrorMessage } from "~/utils/errorMessage";

export default function CreateFlagPanel() {
  const [name, setName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const revalidator = useRevalidator();
  const { setCurrentFlag } = useContext(CurrentFlagContext);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setConfirming(true);
  }

  function handleCancel() {
    setConfirming(false);
  }

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const flag = await getApiClient().createFlag({ name: name.trim() });
      setName("");
      setConfirming(false);
      await revalidator.revalidate();
      setTimeout(() => {
        setCurrentFlag(`flagcard_${flag.id}`);
        scrollToElement(`flagcard_${flag.id}`, "smooth", "start");
      }, 250);
    } catch (err) {
      const message = extractErrorMessage(err, "Failed to create flag");
      setError(message);
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Create New Flag
        </h2>
        <div className="flex items-center gap-2">
          <p className="flex-1 text-sm text-gray-800 truncate">
            Create new flag{" "}
            <span className="font-semibold">&lsquo;{name}&rsquo;</span>?
          </p>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating…" : "Yes"}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            No
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-700 mb-3">
        Create New Flag
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Flag name"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Create
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
