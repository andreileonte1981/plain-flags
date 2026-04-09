import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "~/firebase";
import { getApiClient } from "~/client/api-client";

export default function CreateAdminPanel({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  function validate(): boolean {
    if (!email.trim()) {
      setError("New admin email required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Invalid email address");
      return false;
    }
    return true;
  }

  async function handleCreate() {
    setLoading(true);
    setError("");
    try {
      const result = await getApiClient().createUsers(email.trim(), "admin");
      const created = email.trim();
      setEmail("");
      try {
        await sendPasswordResetEmail(getFirebaseAuth(), created);
      } catch {
        // best-effort; user is still created
      }
      setCreatedEmail(created);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Error creating admin",
      );
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }
  return (
    <div className="flex flex-col gap-2 w-full font-semibold text-gray-600 px-3 border-b-4 py-2">
      {createdEmail ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-green-700">
            Admin <span className="font-bold">{createdEmail}</span> created. A
            password reset email has been sent. Please advise the new admin to
            check their inbox and spam folders.
          </p>
          <button
            className="self-start text-sm text-gray-500 hover:underline"
            onClick={() => {
              setCreatedEmail(null);
              onCreated();
            }}
          >
            Done
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between flex-wrap gap-2 w-full">
          <div className="flex flex-col grow flex-1 items-start">
            <input
              type="email"
              className="border-2 rounded p-1 focus:ring-0 focus:border-current placeholder-gray-300 w-full"
              value={email}
              placeholder="New admin email"
              onChange={(e) => {
                setError("");
                setEmail(e.target.value);
              }}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          {confirm ? (
            <div className="flex gap-2 items-center">
              <span className="text-sm">Create admin {email}?</span>
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
              Create admin
            </button>
          )}
        </div>
      )}
    </div>
  );
}
