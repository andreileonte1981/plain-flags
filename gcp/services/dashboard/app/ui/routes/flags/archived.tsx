import { redirect } from "react-router";
import { useState, useEffect } from "react";
import { getApiClient } from "~/client/api-client";
import type { Flag } from "~/client/api-client";
import { getFirebaseAuth } from "~/firebase";
import ArchivedFlagItem from "./components/archivedFlagItem";

export function meta() {
  return [
    { title: "Archived Flags - Plain Flags" },
    { name: "description", content: "View archived feature flags" },
  ];
}

export async function clientLoader() {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    return redirect("/login");
  }
  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const isAdmin = role === "admin" || role === "superadmin";
  if (!isAdmin) {
    return redirect("/flags");
  }
  return null;
}

const PAGE_SIZE = 20;

export default function ArchivedFlags() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [flags, setFlags] = useState<Flag[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const from = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, count);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getApiClient()
      .listArchivedFlags(page, PAGE_SIZE, filter)
      .then((result) => {
        if (!cancelled) {
          setFlags(result.flags);
          setCount(result.count);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load archived flags",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, filter]);

  function applyFilter() {
    setPage(1);
    setFilter(inputValue);
  }

  function clearFilter() {
    setInputValue("");
    setPage(1);
    setFilter("");
  }

  return (
    <div className="text-gray-600 font-semibold">
      {/* Header bar */}
      <div className="sticky md:top-0 top-12 z-10 bg-white flex flex-wrap justify-start gap-4 items-center border-b-4 border-gray-200 px-4 py-3">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Filter by name…"
            className="border border-gray-300 rounded px-3 py-1 text-sm font-normal text-gray-700 focus:outline-none focus:border-gray-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilter()}
          />
          <button
            onClick={applyFilter}
            className="text-sm font-bold px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-700"
          >
            Search
          </button>
          {filter && (
            <button
              onClick={clearFilter}
              className="text-sm text-gray-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {from}–{to} of {count}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 text-sm rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-sm rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
              >
                ‹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 text-sm rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1 text-sm rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : flags.length === 0 ? (
          <p className="text-gray-400 text-sm">No archived flags found.</p>
        ) : (
          <div className="bg-white shadow rounded-lg divide-y divide-gray-100">
            {flags.map((flag) => (
              <div key={flag.id} className="px-5">
                <ArchivedFlagItem id={flag.id} name={flag.name} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
