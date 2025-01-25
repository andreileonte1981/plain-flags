import { redirect } from "react-router";
import Client from "~/client/client";
import type { Route } from "../../+types/root";
import type Constraint from "~/domain/constraint";
import ConstraintCard from "./components/constraintCard";
import ConstraintFilters from "./components/constraintFilters";
import { useState } from "react";
import GreenPlusButton from "~/components/reusables/greenPlusButton";
import CreateConstraintPanel from "./components/createConstraintPanel";

export async function clientLoader({}) {
  if (!localStorage.getItem("jwt")) {
    return redirect("/login");
  }
  const response = await Client.get("constraints");

  return response.data;
}

export default function Constraints({ loaderData }: Route.ComponentProps) {
  const constraints = loaderData as Constraint[] | undefined;

  if (!constraints) {
    return <div>Loading...</div>;
  }

  const [filters, setFilters] = useState({
    description: "",
    key: "",
    value: "",
  });

  const filteredConstraints = constraints
    .filter(
      (c) =>
        c.description
          .toLowerCase()
          .indexOf(filters.description.toLowerCase()) >= 0
    )
    .filter((c) => c.key.toLowerCase().indexOf(filters.key.toLowerCase()) >= 0)
    .filter((c) =>
      c.values.some(
        (v) => v.toLowerCase().indexOf(filters.value.toLowerCase()) >= 0
      )
    );
  const [isCreateOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white mx-2">
        <div className="flex flex-wrap justify-between items-center border-b-4">
          <ConstraintFilters filters={filters} setFilters={setFilters} />
          <GreenPlusButton
            onClick={() => {
              setCreateOpen(!isCreateOpen);
            }}
            text="Create new constraint"
          ></GreenPlusButton>
        </div>
        {isCreateOpen && (
          <CreateConstraintPanel setCreateOpen={setCreateOpen} />
        )}
      </div>

      <div>
        {!filteredConstraints.length && (
          <div className="text-center my-5 text-gray-400">
            No constraints found
          </div>
        )}

        <ul>
          {filteredConstraints.map((c) => (
            <li className="m-2" key={c.id}>
              <ConstraintCard
                id={c.id}
                description={c.description}
                constraintkey={c.key}
                values={c.values}
                flags={c.flags}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
