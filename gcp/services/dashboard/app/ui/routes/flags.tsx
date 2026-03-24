import { Link } from "react-router";
import type { Flag } from "~/client/api-client";
import { getApiClient } from "~/client/api-client";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Feature Flags - Plain Flags" },
    { name: "description", content: "Manage your feature flags" },
  ];
}

export async function clientLoader() {
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
  const statusClassName = flag.isOn
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-800";

  return (
    <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{flag.name}</h3>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClassName}`}
        >
          {flag.isOn ? "ON" : "OFF"}
        </span>
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
    </div>
  );
}

export default function Flags({ loaderData }: Route.ComponentProps) {
  const { flags, error } = loaderData as {
    flags: Flag[];
    error: string | null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Feature Flags
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage and monitor your feature flags
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                ← Back to Home
              </Link>
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
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Summary ({flags.length} flags)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {flags.filter((f) => f.isOn && !f.isArchived).length}
                  </div>
                  <div className="text-sm text-green-700">Active</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {flags.filter((f) => !f.isOn && !f.isArchived).length}
                  </div>
                  <div className="text-sm text-gray-700">Inactive</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {flags.filter((f) => f.isArchived).length}
                  </div>
                  <div className="text-sm text-orange-700">Archived</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flags.map((flag) => (
                <FlagCard key={flag.id} flag={flag} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
