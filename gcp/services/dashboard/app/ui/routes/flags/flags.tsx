import { redirect } from "react-router";
import { useNavigate } from "react-router";
import { useContext, useEffect, useState } from "react";
import type { Flag } from "~/client/api-client";
import { getApiClient } from "~/client/api-client";
import { getFirebaseAuth } from "~/firebase";
import { Route } from "./+types/flags";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import { scrollToElement } from "~/utils/scrollTo";
import CreateFlagPanel from "./components/createFlagPanel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Feature Flags - Plain Flags" },
    { name: "description", content: "Manage your feature flags" },
  ];
}

export async function clientLoader() {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    return redirect("/login");
  }

  try {
    const client = getApiClient();
    const flags = await client.listFlags();
    return { flags, error: null };
  } catch (error) {
    console.error("Failed to load flags:", error);
    return {
      flags: [],
      error: error instanceof Error ? error.message : "Failed to load flags",
    };
  }
}

interface FlagCardProps {
  flag: Flag;
}

function FlagCard({ flag }: FlagCardProps) {
  const flagCardId = `flagcard_${flag.id}`;
  const { currentFlag, setCurrentFlag } = useContext(CurrentFlagContext);
  const navigate = useNavigate();
  const isCurrent = currentFlag === flagCardId;

  const statusClassName = flag.isOn
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-800";

  const borderClassName = isCurrent
    ? "border-4 border-green-600 shadow-lg"
    : "border border-gray-200 shadow hover:shadow-md";

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    setCurrentFlag(flagCardId);
    navigate(`/flags/${flag.id}`);
  }

  return (
    <a
      id={flagCardId}
      href={`/flags/${flag.id}`}
      onClick={handleClick}
      className={`block bg-white rounded-lg p-6 border-l-4 border-l-green-500 scroll-mt-32 transition-shadow ${borderClassName}`}
    >
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
        {flag.isArchived && (
          <p className="text-sm text-orange-600 font-medium mt-1">Archived</p>
        )}
      </div>
    </a>
  );
}

export default function Flags({ loaderData }: Route.ComponentProps) {
  const { flags, error } = loaderData as {
    flags: Flag[];
    error: string | null;
  };
  const { currentFlag } = useContext(CurrentFlagContext);

  useEffect(() => {
    if (currentFlag) {
      scrollToElement(currentFlag, "instant");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-12 md:top-0 z-10 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-8">
              <div className="hidden lg:block flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  Feature Flags
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage and monitor your feature flags
                </p>
              </div>
              <div className="w-full lg:w-80 xl:w-96 shrink-0">
                <CreateFlagPanel />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading flags
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No feature flags found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first feature flag in the management service.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flags.map((flag) => (
              <FlagCard key={flag.id} flag={flag} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
