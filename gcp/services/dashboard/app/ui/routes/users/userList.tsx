import { useState } from "react";
import { getApiClient, User } from "~/client/api-client";

export default function UserList({
  users,
  onDeleted,
}: {
  users: User[];
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    setDeleting(id);
    setError("");
    try {
      await getApiClient().deleteUser(id);
      onDeleted(id);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  }

  return (
    <div>
      {error && (
        <p className="text-red-500 text-xs font-semibold px-3 py-1">{error}</p>
      )}
      <div className="grid md:grid-cols-[70%,20%,10%] grid-cols-[55%,30%,15%] items-center p-2 text-gray-600">
        {users.map((u) => (
          <div key={u.id} className="contents">
            <div className="break-all pb-2">
              {u.role === "admin" || u.role === "superadmin" ? (
                <span className="font-bold">{u.email}</span>
              ) : (
                <span>{u.email}</span>
              )}
            </div>
            <div className="pb-2 text-xs text-center font-semibold text-gray-500">
              {u.role}
            </div>
            <div className="pb-2 flex justify-end">
              {u.role !== "superadmin" &&
                (confirmId === u.id ? (
                  <div className="flex gap-1">
                    <button
                      className="text-xs text-red-600 font-bold hover:underline"
                      disabled={deleting === u.id}
                      onClick={() => handleDelete(u.id)}
                    >
                      {deleting === u.id ? "…" : "Yes"}
                    </button>
                    <button
                      className="text-xs text-gray-500 hover:underline"
                      onClick={() => setConfirmId(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    className="text-xs text-red-400 hover:text-red-600"
                    onClick={() => {
                      setError("");
                      setConfirmId(u.id);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25ZM6.5 3.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75V4h-3V3.25Zm.944 4.498-.25 3.5a.75.75 0 1 0 1.498.107l.25-3.5a.75.75 0 1 0-1.498-.107Zm2.662-.106a.75.75 0 0 1 .695.8l-.25 3.5a.75.75 0 0 1-1.497-.107l.25-3.5a.75.75 0 0 1 .802-.693Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                ))}
            </div>
            <div className="col-span-3 w-full h-0.5 bg-gray-100 mb-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
