import { useState } from "react";
import { getApiClient } from "~/client/api-client";

export default function CreateUsersPanel({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [emails, setEmails] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  function validate(): boolean {
    if (!emails.trim()) {
      setError("At least one email required");
      return false;
    }
    const parts = emails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const invalid = parts.filter((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (invalid.length) {
      setError(`Invalid emails: ${invalid.join(", ")}`);
      return false;
    }
    return true;
  }

  async function handleCreate() {
    setLoading(true);
    setError("");
    try {
      const result = await getApiClient().createUsers(emails, "user");
      if (result.errors.length) {
        setError(result.errors.join("; "));
      } else {
        setEmails("");
        onCreated();
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Error creating users",
      );
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 w-full font-semibold text-gray-600 px-3 border-b-4 py-2">
      <div className="flex flex-col grow flex-1 items-start">
        <textarea
          className="border-2 rounded p-1 focus:ring-0 focus:border-current placeholder-gray-300 resize-y w-full"
          value={emails}
          placeholder="New user emails (comma separated)"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => {
            setError("");
            setEmails(e.target.value);
          }}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      {confirm ? (
        <div className="flex gap-2 items-center">
          <span className="text-sm">Create users?</span>
          <button
            className="text-green-600 font-bold text-sm hover:underline"
            disabled={loading}
            onClick={handleCreate}
          >
            {loading ? "Creating…" : "Yes"}
          </button>
          <button
            className="text-gray-500 text-sm hover:underline"
            onClick={() => setConfirm(false)}
          >
            No
          </button>
        </div>
      ) : (
        <button
          className="flex items-center gap-1 bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded hover:bg-green-700"
          onClick={() => {
            if (validate()) setConfirm(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4"
          >
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          Create users
        </button>
      )}
    </div>
  );
}
