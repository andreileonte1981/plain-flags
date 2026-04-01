import { redirect } from "react-router";
import { useContext, useEffect, useState } from "react";
import type { Constraint } from "~/client/api-client";
import { getApiClient } from "~/client/api-client";
import { getFirebaseAuth } from "~/firebase";
import { Route } from "./+types/constraints";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { scrollToElement } from "~/utils/scrollTo";
import ConstraintCard from "./components/constraintCard";
import ConstraintFilters from "./components/constraintFilters";
import CreateConstraintPanel from "./components/createConstraintPanel";
import SearchIcon from "~/ui/icons/searchIcon";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Constraints - Plain Flags" },
    { name: "description", content: "Control access to your features" },
  ];
}

export async function clientLoader() {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    return redirect("/login");
  }

  try {
    const client = getApiClient();
    const constraints = await client.listConstraints();
    return { constraints, error: null };
  } catch (error) {
    console.error("Failed to load constraints:", error);
    return {
      constraints: [],
      error:
        error instanceof Error ? error.message : "Failed to load constraints",
    };
  }
}

export default function Constraints({ loaderData }: Route.ComponentProps) {
  const { constraints, error } = loaderData as {
    constraints: Constraint[];
    error: string | null;
  };

  const [filtersShown, setFiltersShown] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);

  const [filters, setFilters] = useState({
    description: "",
    key: "",
    value: "",
  });

  const { currentConstraint } = useContext(CurrentConstraintContext);

  useEffect(() => {
    if (currentConstraint) {
      scrollToElement(`constraintcard_${currentConstraint}`, "instant");
    }
  }, []);

  const filteredConstraints = (constraints ?? [])
    .filter((c) =>
      c.description.toLowerCase().includes(filters.description.toLowerCase()),
    )
    .filter((c) => c.key.toLowerCase().includes(filters.key.toLowerCase()))
    .filter(
      (c) =>
        filters.value === "" ||
        c.values.some((v) =>
          v.toLowerCase().includes(filters.value.toLowerCase()),
        ),
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top section */}
      <div className="sticky top-12 md:top-0 z-10 bg-white shadow">
        {/* Toolbar: filter toggle + create button */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center border-b-4 border-magenta/20 pb-2 md:pb-0 md:px-4">
          {filtersShown ? (
            <div className="flex md:flex-row flex-row-reverse md:gap-2 items-center">
              <button
                className="text-sm font-semibold text-gray-500 hover:underline px-3 py-2"
                onClick={() => setFiltersShown(false)}
              >
                Close
              </button>
              <ConstraintFilters filters={filters} setFilters={setFilters} />
            </div>
          ) : (
            <button
              className="bg-purple-900 text-white font-bold uppercase text-sm h-12 md:m-3 p-3 px-5 cursor-pointer hover:bg-purple-700 active:bg-purple-800 rounded flex-none"
              onClick={() => setFiltersShown(true)}
              title="Show filters"
            >
              <SearchIcon />
            </button>
          )}

          {!isCreateOpen && (
            <button
              className="bg-purple-700 text-white font-bold text-sm px-5 py-2 rounded hover:bg-purple-600 active:bg-purple-800 md:m-3"
              onClick={() => setCreateOpen(true)}
            >
              + Create new constraint
            </button>
          )}
        </div>

        {/* Collapsible create panel */}
        <CreateConstraintPanel
          isOpen={isCreateOpen}
          onClose={() => setCreateOpen(false)}
        />
      </div>

      {/* List */}
      <main className="py-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mx-4">
            <h3 className="text-sm font-medium text-red-800">
              Error loading constraints
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        ) : filteredConstraints.length === 0 ? (
          <div className="text-center my-5 text-gray-400">
            No constraints found
          </div>
        ) : (
          <ul className="pt-2">
            {filteredConstraints.map((c) => (
              <li key={c.id}>
                <ConstraintCard constraint={c} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
