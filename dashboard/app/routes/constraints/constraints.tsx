import { redirect } from "react-router";
import Client from "~/client/client";
import type { Route } from "../../+types/root";
import type Constraint from "~/domain/constraint";
import ConstraintCard from "./components/constraintCard";

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

  if (constraints.length === 0) {
    return <div>No constraints</div>;
  }

  return (
    <div>
      <div>
        <ul>
          {constraints.map((c) => (
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
