import { redirect } from "react-router";
import Client from "~/client/client";
import type { Route } from "../+types/root";
import type Constraint from "~/domain/constraint";

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
              <div
                id={`flagcard_${c.id}`}
                className="border-2 rounded border-gray-300 m-2 p-2 text-gray-500 font-semibold"
              >
                <div className="flex justify-between my-2 border-b">
                  <div className="font-bold text-gray-700">{c.description}</div>
                  <div className="text-xs text-gray-400">id: {c.id}</div>
                </div>

                <div>
                  <div>
                    <div className="my-2">
                      For:{" "}
                      <span className="font-bold text-gray-700">{c.key}</span>
                    </div>

                    <div>
                      Named:{" "}
                      <span className="font-bold text-gray-700">
                        {c.values.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                {c.flags.length > 0 && (
                  <div className="border-2 border-purple-200 rounded p-2 mt-2">
                    <div className="m-2">Flags constrained:</div>

                    <ul>
                      {c.flags.map((f) => (
                        <li key={f} className="m-2">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
