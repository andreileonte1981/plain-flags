import { redirect } from "react-router";
import { useContext, useEffect } from "react";
import type { Flag } from "~/client/api-client";
import { getApiClient } from "~/client/api-client";
import { getFirebaseAuth } from "~/firebase";
import { Route } from "./+types/flags";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import { scrollToElement } from "~/utils/scrollTo";
import CreateFlagPanel from "./components/createFlagPanel";
import FlagCard from "./components/flagCard";

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
          <ul className="pt-2">
            {flags.map((flag) => (
              <li key={flag.id} className="mb-4">
                <FlagCard flag={flag} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
